'use strict';
var express = require('express');
var router = express.Router();
var discounts = require('../models/discounts.js');
var veterans = require('../models/veterans.js');

//admin home page
router.get('/', function(req, res) {
  var adminDisplay = {}
  var holdingDiscounts = discounts.returnAllHolding();
  holdingDiscounts.then(function(result) {
    adminDisplay.holdingDiscounts = result
    var holdingVeterans = veterans.returnAllHolding();
    holdingVeterans.then(function(result) {
      adminDisplay.holdingVeterans = result
      res.render('admin', { 
        holding_discounts: adminDisplay.holdingDiscounts,
        holding_veterans: adminDisplay.holdingVeterans });  
    }) 
    
  })
});

//holding_discounts update, delete, and validate function
router.post('/holding_discounts', function(req, res) {
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