'use strict';
var express = require('express');
var router = express.Router();
var discounts = require('../models/discounts.js');
var veterans = require('../models/veterans.js');

//admin home page
router.get('/', function(req, res) {
  var adminDisplay = {}
  var holdingDiscounts = discounts.returnAllHoldingDiscounts();
  holdingDiscounts.then(function(result) {
    adminDisplay.holdingDiscounts = result
    var liveDiscounts = discounts.returnAllDiscounts();
    liveDiscounts.then(function(result) {
      adminDisplay.liveDiscounts = result
      var holdingVeterans = veterans.returnAllHolding();
      holdingVeterans.then(function(result) {
        adminDisplay.holdingVeterans = result
        res.render('admin', { 
          holding_discounts: adminDisplay.holdingDiscounts,
          live_discounts: adminDisplay.liveDiscounts,
          holding_veterans: adminDisplay.holdingVeterans });  
      }) 
    })
  })
});

//holding_discounts update, delete, and validate function
router.post('/holding_discounts', function(req, res) {
//new discount variable for when a new live or holding discount is created
  var newDiscount = {
  busname : req.body.busname, 
  county : req.body.county,
  state : req.body.state,
  zip : req.body.zip,
  category : req.body.category,
  street: req.body.street,
  buslinks : req.body.buslinks,
  desoffer : req.body.desoffer,
  expiration : req.body.expiration,
  cname : req.body.cname,
  busmail : req.body.busmail,
  cphone : req.body.cphone,
  notes: req.body.notes }
  if (req.body.action === "Delete") {
    discounts.deleteHoldingDiscount(req.body.id)
    res.redirect('/admin')
  } else if (req.body.action === "Update") {
    discounts.updateHoldingDiscount(req.body)
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
  } else if (req.body.action === "Create_Holding") {
    discounts.createHoldingDiscount(newDiscount);
    res.redirect('/admin')
  } else if (req.body.action === "Create_Live") {
    discounts.createDiscount(newDiscount);
    res.redirect('/admin')
  }
});

//live_discounts update, delete, and validate function
router.post('/live_discounts', function(req, res) {
  if (req.body.action === "Delete") {
    discounts.deleteDiscount(req.body.id)
    res.redirect('/admin')
  } else if (req.body.action === "Update") {
    discounts.updateDiscount(req.body)
    res.redirect('/admin')
  } 
});

//holding_veterans update, delete, and validate function
router.post('/holding_veterans', function(req, res) {
  if (req.body.action === "Delete") {
    veterans.deleteHoldingDiscount(req.body.id)
    res.redirect('/admin')
  } else if (req.body.action === "Update") {
    veterans.updateHoldingDiscount(req.body)
    res.redirect('/admin')
  } else if (req.body.action === "Validate") {
    var holdingId = req.body.id
    delete req.body.id
    delete req.body.action
    var validateHolding = veterans.validateHoldingDiscount(req.body)
    validateHolding.then( (result) => {
      var deleteHolding = veterans.deleteHoldingDiscount(holdingId) 
      deleteHolding.then( (result) => {
        res.redirect('/admin')
      })
    })
  }
});

module.exports = router;