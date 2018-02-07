'use strict';
var express = require('express');
var router = express.Router();
var discounts = require('../models/discounts.js');

// discounts index listing
router.get('/', function(req, res) {
  discounts.returnAllDiscounts().then( function (discounts) {
    res.render('discount', {discounts : discounts} )
  }).catch( function ( err ) {
    throw err
  });
});

// discounts sorted by category
router.get('/categories/:id', function (req, res, next) {
  discounts.returnDiscountsByCategory(req.params.id).then( function (discounts) {
    res.render('discount', {discounts : discounts, category : discounts[0].name});
  }).catch( function (err) {
    if (err) throw err
  });
});

// discounts sorted by county
router.get('/counties/:id', function (req, res, next) {
  discounts.returnDiscountsByCounty(req.params.id).then( function (discounts) {
    res.render('discount', {discounts : discounts, county : discounts[0].name});
  }).catch( function (err) {
    if (err) throw err
  });
});

/* Get discounts by Id */
router.get('/view/:slug', function(req, res, next) {
  res.send(`Discount with id ${req.params.slug} displayed here`);
});

/* Get discounts by search result */
router.get('/search/:slug', function(req, res, next) {
  res.send(`Discounts that match ${req.params.slug} displayed here`);
});


module.exports = router;