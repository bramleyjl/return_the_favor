'use strict';
var express = require('express');
var router = express.Router();
var passport = require('passport');
var discounts = require('../models/discounts.js');
var veterans = require('../models/veterans.js');
const Json2csvParser = require('json2csv').Parser;
var moment = require('moment');

//authentication helper function
function ensureAuthenticated(req, res, next) {
  return next();
  /*if (req.isAuthenticated()) { return next(); }
  res.redirect('/admin')*/
}

//login route
router.post('/login',
  passport.authenticate('local', { successRedirect: '/admin',
                                   failureRedirect: '/admin' })
);

//logout route
router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

//admin index page
router.get('/', function(req, res) {
  res.render('admin');
});

/////////lookup page functions/////////

//admin lookup page
router.get('/lookup', ensureAuthenticated, function(req, res) {
  res.render('adminLookup');
});

//live_discounts filtered page
router.get('/live_discounts', ensureAuthenticated, function(req, res) {
  if (req.query.action === "idLookup") {
    var searchQuery = discounts.returnDiscountsById([req.query.id]);
    searchQuery.then(function(result) {
      if (result.length === 0) {
        var noDiscounts = "true"
        res.render('adminLookup', {no_discounts: noDiscounts})
      } else {
      result = discounts.checkExpiration(result, "admin")
      res.render('adminLookup', {live_discounts: result, discountIDs: result[0].id})
      }
    })
  } else {
    var searchParams = {
      county : req.query.county,
      category : req.query.category,
      state : req.query.state
    }
    var searchQuery = discounts.adminFilterDiscounts(searchParams);
    searchQuery.then(function(results) {
      if (results.length === 0) {
        var noDiscounts = true
        res.render('adminLookup', {no_discounts: noDiscounts})
      } else {
      results = discounts.checkExpiration(results, "admin")
      if (req.query.order === 'descending') results = results.reverse()
      //creates an array of all ids to be viewed so that they can be
      //packaged into the page view (for csv export) and each id object (for update/delete functions)
      var discountIDs = [];
      for (var i = results.length - 1; i >= 0; i--) {
        discountIDs.unshift(results[i].id);
      }
      for (var j = results.length - 1; j >= 0; j--) {
        results[j].discountIDs = discountIDs
      }  
      res.render('adminLookup', {live_discounts: results, discountIDs: discountIDs});
      }
    });
  };
});

//live_discounts export funtion
router.post('/live_discounts/export', ensureAuthenticated, function(req, res) {
  //turn list of ids to an array of integers
  var ids = req.body.discounts.split(',').map(Number);
  var exportDiscounts = discounts.returnDiscountsById(ids)
  exportDiscounts.then(function(results) {
    var fields = [{
      label: 'ID',
      value: 'id'
    },{
      label: 'Business',
      value: 'busname'
    },{
      label: 'Counties',
      value: 'county_names'
    },{
      label: 'Discount',
      value: 'desoffer'
    },{
      label: 'Contact',
      value: 'cname'
    },{
      label: 'Phone',
      value: 'cphone'
    },{
      label: 'Email',
      value: 'busmail'
    },{
      label: 'Notes',
      value: 'notes'
    }];      
    var parser = new Json2csvParser({fields});
    var csv = parser.parse(results);
    var time = moment().format("MM-DD-YY_HH.MM")
    
    res.attachment(`discounts${time}.csv`);
    res.status(200).send(csv);
  });
});

//live_discounts update and delete function
router.post('/live_discounts', ensureAuthenticated, function(req, res) {
  var discountIDs = req.body.discountIDs.split(',').map(Number);
  if (req.body.action === "Delete") {
    var removeID = discountIDs.indexOf(parseInt(req.body.id))
    discountIDs.splice(removeID, 1);
    discounts.deleteDiscount(req.body.id)
    //skips discount lookup if there was only one discount (that was just deleted)
    if (discountIDs.length === 0) res.render('adminLookup')
    //fetches previous page's discounts and passes them to template for viewing
    var remainingDiscounts = discounts.returnDiscountsById(discountIDs)
    remainingDiscounts.then(function(results){
      //sets all discounts' expiration status
      results = discounts.checkExpiration(results, "admin")
      var discountIDs = [];
      for (var i = results.length - 1; i >= 0; i--) {
        discountIDs.unshift(results[i].id);
      }
      for (var j = results.length - 1; j >= 0; j--) {
        results[j].discountIDs = discountIDs
      }
      res.render('adminLookup', {live_discounts: results, discountIDs: discountIDs})        
    });
  } else if (req.body.action === "Update") {
    //updates discount
    var updatedDiscount = discounts.updateDiscount(req.body)
    updatedDiscount.then(function(result) {
      //creates or deletes liveDiscounts_counties rows as necessary
      var updatedDiscountCounties = discounts.updateDiscountCounties(req.body)
      updatedDiscountCounties.then(function(result) {
        //grabs updated discount so it can be at the top of the results displayed
        var getUpdatedDiscount = discounts.returnDiscountsById([req.body.id])
        getUpdatedDiscount.then(function(result) {
          var updated_discount = result
          //removes updated discount from list of IDs so it isn't fetched twice
          var removeID = discountIDs.indexOf(parseInt(req.body.id))
          discountIDs.splice(removeID, 1);
          //presents updated ID if it was the only one displayed previously
          if (discountIDs.length === 0) {
            if (req.body.originalExpiration !== req.body.expiration) discounts.bumpToRecent(req.body.id)
            var live_discount = discounts.checkExpiration(updated_discount[0], "admin")
            res.render('adminLookup', {live_discounts: live_discount, discountIDs: live_discount.id})            
          } else {
            //fetches previous page's other discounts and passes them to template for viewing
            var remainingDiscounts = discounts.returnDiscountsById(discountIDs)
            remainingDiscounts.then(function(results){
              results.unshift(updated_discount[0])
              //checks to see if expiration was updated, then sets all discounts' expiration status
              if (req.body.originalExpiration !== req.body.expiration) discounts.bumpToRecent(req.body.id)
              results = discounts.checkExpiration(results, "admin")
              var discountIDs = [];
              for (var i = results.length - 1; i >= 0; i--) {
                discountIDs.unshift(results[i].id);
              }
              for (var j = results.length - 1; j >= 0; j--) {
                results[j].discountIDs = discountIDs
              }
              res.render('adminLookup', {live_discounts: results, discountIDs: discountIDs})        
            });
          }
        });
      });    
    });
  }
});

//live_discounts business name search
router.get('/business_search', ensureAuthenticated, function(req, res) {
  var searchResults = discounts.businessLookup(req.query.busname)
  searchResults.then(function(results) {
    if (results.length === 0) {
      var noBusiness = true
      res.render('adminLookup', {no_business: noBusiness})
    } else {
    res.render('adminLookup', {business_search: results})
    }
  })
});

//live_veterans update and delete function
router.post('/live_veterans', ensureAuthenticated, function(req, res) {
  if (req.body.action === "Delete") {
    veterans.deleteLiveVeteran(req.body.id)
    res.redirect('/admin/lookup')
  } else if (req.body.action === "Update") {
    veterans.updateLiveVeteran(req.body)
    var searchResults = veterans.veteranLookup(req.body.email)
    searchResults.then(function(results) {
      res.render('adminLookup', {live_veterans: results})
    })
  } 
});

//live_veterans email search
router.get('/veteran_search', ensureAuthenticated, function(req, res) {
  var searchResults = veterans.veteranLookup(req.query.email)
  searchResults.then(function(results) {
  if (results.length === 0) {
    var noVeteran = true
    res.render('adminLookup', {no_veteran: noVeteran})
  } else {
    res.render('adminLookup', {live_veterans: results})
  }
  })
});

//live_veterans export funtion
router.post('/live_veterans/export', ensureAuthenticated, function(req, res) {
  var exportVeterans = veterans.returnAllVeterans();
    exportVeterans.then(function(results) {
      var fields = [{
        label: 'ID',
        value: 'id'
      },{
        label: 'Name',
        value: 'name'
      },{
        label: 'Email',
        value: 'email'
      }];      
      var parser = new Json2csvParser({fields});
      var csv = parser.parse(results);
      var time = moment().format("MM-DD-YY_HH.MM")

      res.attachment(`veterans${time}.csv`);
      res.status(200).send(csv);
    });
});

/////////holding page functions/////////

//admin holding page
router.get('/holding', ensureAuthenticated, function(req, res) {  
  var adminDisplay = {}
  var holdingDiscounts = discounts.returnAllHoldingDiscounts();
  holdingDiscounts.then(function(result) {
    if (result.length > 0) adminDisplay.holdingDiscounts = result
    var holdingVeterans = veterans.returnAllHoldingVeterans();
    holdingVeterans.then(function(result) {
      if (result.length > 0) adminDisplay.holdingVeterans = result
      res.render('adminHolding', { 
        holding_discounts: adminDisplay.holdingDiscounts,
        holding_veterans: adminDisplay.holdingVeterans
      });
    });
  });
});

//holding_discounts update, delete, and validate function
router.post('/holding_discounts', ensureAuthenticated, function(req, res) {
  if (req.body.action === "Delete") {
    discounts.deleteHoldingDiscount(req.body.id)
    res.redirect('/admin/holding')
  } else if (req.body.action === "Validate") {
    var holdingId = req.body.id
    delete req.body.id
    delete req.body.action
    var validateHolding = discounts.validateHoldingDiscount(req.body)
    validateHolding.then( (result) => {
      var deleteHolding = discounts.deleteHoldingDiscount(holdingId) 
      deleteHolding.then( (result) => {
      res.redirect('/admin/holding')
      });
    });
  }
});

//holding_veterans update, delete, and validate function
router.post('/holding_veterans', ensureAuthenticated, function(req, res) {
  //new veteran variable for when a new live or holding veteran is created
  var newVeteran = {
    name : req.body.name,
    email : req.body.email,
    county : req.body.county   
  }
  if (req.body.action === "Delete") {
    veterans.deleteHoldingVeteran(req.body.id)
    res.redirect('/admin/holding')
  } else if (req.body.action === "Validate") {
    var holdingId = req.body.id
    delete req.body.id
    delete req.body.action
    var validateHolding = veterans.validateHoldingVeteran(req.body)
    validateHolding.then( (result) => {
      var deleteHolding = veterans.deleteHoldingVeteran(holdingId) 
      deleteHolding.then( (result) => {
        res.redirect('/admin/holding')
      })
    })
  }
});


module.exports = router;