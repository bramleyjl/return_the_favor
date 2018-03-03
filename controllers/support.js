'use strict';
var express = require('express');
var discounts = require('../models/discounts.js');

var router = express.Router();

// GET signups index
router.get('/', function(req, res, next) {
  res.render('support');
});

// confirmation after submitting a discount
router.get('/confirmation', function(req, res, next) {
  res.render('thanks', {business : true});
});

// Submit new discount form
router.post('/discount', function(req, res, next) {
  var newDiscount = {
    busname : req.body.busname,
    state : req.body.state,
    zip : req.body.zip,
    category : req.body.category,
    street: req.body.street,
    buslinks : req.body.buslinks,
    desoffer : req.body.desoffer,
    expiration : req.body.expiration,
    cname : req.body.cname,
    busmail : req.body.busmail,
    cphone : req.body.cphone }
  var newDiscountCounties = req.body.counties
  discounts.createHoldingDiscount(newDiscount, newDiscountCounties);
  res.redirect('/support/confirmation');
});

module.exports = router;