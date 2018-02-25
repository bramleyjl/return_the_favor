'use strict';
var express = require('express');
var router = express.Router();
var discounts = require('../models/discounts.js');

/* GET home page. */
router.get('/', function(req, res) {
  var defaultSearch = {
    county : 'all',
    zip : '',
    category : 'all',
    search : '',
    recent : '21'
  }
  var defaultQuery = discounts.filterDiscounts(defaultSearch);
  defaultQuery.then(function(results) {
    results = discounts.checkExpiration(results, "user")
    res.render('home', {discounts : results});
  })
});

// alternate home page route
router.get('/home', function(req, res, next) {
  res.redirect('/');
});

//GET about page
router.get('/about', function(req, res, next) {
  res.render('about.hbs');
});

//GET documents page
router.get('/documents', function(req, res, next) {
  res.render('documents.hbs');
});

module.exports = router;