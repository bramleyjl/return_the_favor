'use strict';
var express = require('express');
var router = express.Router();
var discounts = require('../models/discounts.js');
var veterans = require('../models/veterans.js');
var json2csv = require('json2csv').parse;

//admin index page
router.get('/', function(req, res) {
  res.send('AdminHolding -> /admin/holding, AdminLookup -> /admin/lookup')
});

/////////lookup page functions/////////

//admin lookup page
router.get('/lookup', function(req, res) {
    res.render('adminLookup');
});

//live_discounts filtered page
router.get('/live_discounts', function(req, res) {
  if (req.query.action === "idLookup") {
    var searchQuery = discounts.returnDiscountById(req.query.id);
    searchQuery.then(function(result) {
      result = discounts.checkExpiration(result, "admin")
      res.render('adminLookup', {live_discounts: result})
    })
  } else {
    var searchParams = {
      county : req.query.county,
      category : req.query.category,
      state : req.query.state
    }
    var searchQuery = discounts.adminFilterDiscounts(searchParams);
    searchQuery.then(function(results) {
      results = discounts.checkExpiration(results, "admin")
      if (req.query.order === 'descending') results = results.reverse()
      var discountIDs = [];
      for (var i = results.length - 1; i >= 0; i--) {
        discountIDs.unshift(results[i].id);
      }
      for (var j = results.length - 1; j >= 0; j--) {
        results[j].discountIDs = discountIDs
      }
      console.log(discountIDs)      
      res.render('adminLookup', {live_discounts: results});
    });
  };
});

/*
//live_discounts export funtion
router.post('/live_discounts/export', function(req, res) {
  
  const data = req.body.discounts
  const myFields = ['id', 'busname', 'desoffer'];
  console.log(data)

  const fields = ['car', 'price', 'color']
  const myCars = [
    {
      "car": "Audi",
      "price": 40000,
      "color": "blue"
    }, {
      "car": "BMW",
      "price": 35000,
      "color": "black"
    }, {
      "car": "Porsche",
      "price": 60000,
      "color": "green"
    }
  ];
  console.log(myCars)
  const csv = json2csv(myCars, { fields });

  console.log(csv);

        //creation of csv export file
      var data = JSON.stringify(results)
      console.log("Stringified Object ---- " +  data)
      var fields = ['id', 'busname', 'desoffer']
      const csv = json2csv({ data: data, fields });
      console.log("CSV ---- " + csv)


  res.setHeader('Content-disposition', 'attachment; filename=testing.csv');
  res.set('Content-Type', 'text/csv');
  res.status(200).send(csv);

})
*/

//live_discounts update and delete function
router.post('/live_discounts', function(req, res) {
  var discountIDs = req.body.discountIDs.split(',').map(Number);
  if (req.body.action === "Delete") {
    var removeID = discountIDs.indexOf(parseInt(req.body.id))
    discountIDs.splice(removeID, 1);
    discounts.deleteDiscount(req.body.id)
  } else if (req.body.action === "Update") {
    var updatedDiscount = discounts.updateDiscount(req.body)
    updatedDiscount.then(function(result) {
      //checks to see if expiration was updated and bumps discount to top visibility if so
      if (req.body.originalExpiration !== req.body.expiration) discounts.bumpToRecent(req.body.id)
    });
  }
  //fetches previous page's discounts and passes them to template for viewing
  discounts.returnDiscountsByIdArray(discountIDs, function(results){
    results = discounts.checkExpiration(results, "admin")
    //gives each discount an array with all discounts to be viewed to maintain state
    var discountIDs = [];
      for (var i = results.length - 1; i >= 0; i--) {
        discountIDs.unshift(results[i].id);
      }
      for (var j = results.length - 1; j >= 0; j--) {
        results[j].discountIDs = discountIDs
      }
    res.render('adminLookup', {live_discounts: results})        
  });
});

//live_discounts business name search
router.get('/business_search', function(req, res) {
  var searchResults = discounts.businessLookup(req.query.busname)
  searchResults.then(function(results) {
    res.render('adminLookup', {business_search: results})
  })
});

//live_veterans update and delete function
router.post('/live_veterans', function(req, res) {
  if (req.body.action === "Delete") {
    veterans.deleteLiveVeteran(req.body.id)
    res.redirect('/admin')
  } else if (req.body.action === "Update") {
    veterans.updateLiveVeteran(req.body)
    res.redirect('/admin')
  } 
});

//live_veterans email search
router.get('/veteran_search', function(req, res) {
  var searchResults = veterans.veteranLookup(req.query.email)
  searchResults.then(function(results) {
    res.render('adminLookup', {live_veterans: results})
  })
});

/////////holding page functions/////////

//admin holding page
router.get('/holding', function(req, res) {  
  var adminDisplay = {}
  var holdingDiscounts = discounts.returnAllHoldingDiscounts();
  holdingDiscounts.then(function(result) {
    console.log(result)
    if (result.length > 0) adminDisplay.holdingDiscounts = result
    console.log(adminDisplay.holdingDiscounts)
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
router.post('/holding_discounts', function(req, res) {
  if (req.body.action === "Delete") {
    discounts.deleteHoldingDiscount(req.body.id)
    res.redirect('/admin')
  } else if (req.body.action === "Validate") {
    var holdingId = req.body.id
    delete req.body.id
    delete req.body.action
    var validateHolding = discounts.validateHoldingDiscount(req.body)
    validateHolding.then( (result) => {
      var deleteHolding = discounts.deleteHoldingDiscount(holdingId) 
      deleteHolding.then( (result) => {
        res.redirect('/admin')
      })
    })
  }
});

//holding_veterans update, delete, and validate function
router.post('/holding_veterans', function(req, res) {
  //new veteran variable for when a new live or holding veteran is created
  var newVeteran = {
    name : req.body.name,
    email : req.body.email,
    county : req.body.county   
  }
  if (req.body.action === "Delete") {
    veterans.deleteHoldingVeteran(req.body.id)
    res.redirect('/admin')
  } else if (req.body.action === "Validate") {
    var holdingId = req.body.id
    delete req.body.id
    delete req.body.action
    var validateHolding = veterans.validateHoldingVeteran(req.body)
    validateHolding.then( (result) => {
      var deleteHolding = veterans.deleteHoldingVeteran(holdingId) 
      deleteHolding.then( (result) => {
        res.redirect('/admin')
      })
    })
  }
});


module.exports = router;