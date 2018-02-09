'use strict';
var express = require('express');
var router = express.Router();
var discounts = require('../models/discounts.js');

// discounts index listing
router.get('/', function(req, res) {
/*  discounts.returnAllDiscounts().then( function (discounts) {
    res.render('discount', {discounts : discounts} )
  }).catch( function ( err ) {
    throw err
  }); */
res.render('discounts');
});

// discounts searched/filtered
router.post('/', function(req, res) {
  var searchFilters = req.body;

  delete searchFilters["city"]
  delete searchFilters["recent"]
  delete searchFilters["search"]

  console.log(searchFilters);
 /* var stuff = discounts.filterDiscounts(searchFilters);
  stuff.then(function(result) {
   console.log(result) //will log results.
  }) */
  res.redirect('/discounts#sectionTwo');
})

// discounts sorted by category
router.get('/categories/:id', function (req, res, next) {
  discounts.returnDiscountsByCategory(req.params.id).then( function (discounts) {
    res.render('discount', {discounts : discounts, category : discounts[0].name});
  }).catch( function (err) {
    if (err) res.redirect('/discounts');

  });
});

// discounts sorted by county
router.get('/counties/:id', function (req, res, next) {
  discounts.returnDiscountsByCounty(req.params.id).then( function (discounts) {
    res.render('discount', {discounts : discounts, county : discounts[0].name});
  }).catch( function (err) {
    if (err) res.redirect('/discounts');
  });
});

// single discount by id
router.get('/view/:id', function(req, res, next) {
 console.log(req.params.id)
 discounts.returnDiscountsById(req.params.id).then( function (discounts) {
    console.log(discounts)
    res.render('discount', {discounts : discounts})
  }).catch( function (err) {
    if (err) res.redirect('discounts');
  })  
});

/* Get discounts by search result */
router.get('/search/:slug', function(req, res, next) {
  res.send(`Discounts that match ${req.params.slug} displayed here`);
});


module.exports = router;