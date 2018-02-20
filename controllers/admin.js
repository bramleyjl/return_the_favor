'use strict';
var express = require('express');
var router = express.Router();
var discounts = require('../models/discounts.js');
var veterans = require('../models/veterans.js');

//admin index page
router.get('/', function(req, res) {
  res.send('AdminHolding -> /admin/holding, AdminLookup -> /admin/lookup')
});

/////////lookup page functions/////////

//admin live page
router.get('/lookup', function(req, res) {
  var adminDisplay = {}  
  var liveDiscounts = discounts.returnAllDiscounts();
  liveDiscounts.then(function(result) {
    adminDisplay.liveDiscounts = result
    var liveVeterans = veterans.returnAllVeterans();
    liveVeterans.then(function(result) {
      adminDisplay.liveVeterans = result
      res.render('adminLookup', {
        live_discounts: adminDisplay.liveDiscounts,
        live_veterans: adminDisplay.liveVeterans
      });
    });
  });
});

//live_discounts update, delete, and validate function
router.post('/live_discounts', function(req, res) {
  if (req.body.action === "Delete") {
    discounts.deleteDiscount(req.body.id)
    res.redirect('/admin/lookup')
  } else if (req.body.action === "Update") {
    discounts.updateDiscount(req.body)
    res.redirect('/admin/lookup')
  } 
});

//live_veterans update, delete, and validate function
router.post('/live_veterans', function(req, res) {
  if (req.body.action === "Delete") {
    veterans.deleteLiveVeteran(req.body.id)
    res.redirect('/admin')
  } else if (req.body.action === "Update") {
    veterans.updateLiveVeteran(req.body)
    res.redirect('/admin')
  } 
});

/////////holding page functions/////////

//admin holding page
router.get('/holding', function(req, res) {  
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