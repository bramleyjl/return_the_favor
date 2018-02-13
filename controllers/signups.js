'use strict';
var express = require('express');
var veterans = require('../models/veterans.js');
var discounts = require('../models/discounts.js');

var router = express.Router();

// GET signups index
router.get('/', function(req, res, next) {
  res.render('support');
});

// Submit new veteran form
router.post('/veteran', function(req, res, next) {
  if (req.body.name === '' || req.body.email === '' || req.body.county === '') {
    res.redirect('/error')
  }
  veterans.createVeteran(req.body.name, req.body.email, req.body.county);
  res.redirect('/discounts');
});

// Submit new discount form
router.post('/discount', function(req, res, next) {
  var newDiscount = {
    busname : req.body.busname, 
    county : req.body.county,
    state : 1,
    city : req.body.city,
    category : req.body.category,
    street: req.body.street,
    buslinks : req.body.buslinks,
    desoffer : req.body.desoffer,
    expiration : req.body.expiration,
    cname : req.body.cname,
    busmail : req.body.busmail,
    cphone : req.body.cphone }
  discounts.createHoldingDiscount(newDiscount);
  res.redirect('/home');
});

module.exports = router;