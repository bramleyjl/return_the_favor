'use strict';
var express = require('express');
var veterans = require('../models/veterans.js');
var discounts = require('../models/discounts.js');



var router = express.Router();

// GET signups index
router.get('/', function(req, res, next) {
  res.render('support');
});

// GET veterans signup page
router.get('/veterans', function(req, res, next) {
  res.render('signup', { title: 'Veterans Signup', veteran: true });
});

// Submit new veteran form
router.post('/veterans/new', function(req, res, next) {
  if (req.body.name === '' || req.body.email === '' || req.body.county === '') {
    res.redirect('/error')
  }
  veterans.createVeteran(req.body.name, req.body.email, req.body.county);
  res.redirect('/');
});

// GET businesses signup page 
router.get('/businesses', function(req, res, next) {
  res.render('signup', { title: 'Business Signup', business: true });
});

// Submit new discount form
router.post('/businesses/new', function(req, res, next) {
  var newDiscount = {
      business : req.body.business, 
      county : req.body.county,
      state : req.body.state,
      city : req.body.city,
      discount : req.body.discount,
      category : req.body.category,
      website : req.body.website,
      phone : req.body.phone,
      email : req.body.email,
      facebook : req.body.facebook,
      twitter : req.body.twitter,
      instagram : req.body.instagram,
      expiration : req.body.expiration,
      business_contact : req.body.business_contact,
      business_email : req.body.business_email,
      business_phone : req.body.business_phone }
  discounts.createDiscount(newDiscount);
});

module.exports = router;