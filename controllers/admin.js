'use strict';
var express = require('express');
var router = express.Router();
var discounts = require('../models/discounts.js');
var veterans = require('../models/veterans.js');

//admin home page
router.get('/', function(req, res, next) {
  var holding = discounts.returnAllHolding()
  holding.then(function(result) {
    console.log(result)
  })
  res.send('This is the admin index.');
});

//admin discounts
router.get('/discounts', function(req, res, next) {
  res.render('index', { title: 'Admin Discounts' });
});

//admin holding
router.get('/holding', function(req, res, next) {
  res.render('index', { title: 'Admin Holding' });
});

//admin veterans
router.get('/veterans', function(req, res, next) {
  res.render('index', { title: 'Admin Veterans' });
});

module.exports = router;