'use strict';
var express = require('express');
var router = express.Router();
var discounts = require('../models/discounts.js');
var veterans = require('../models/veterans.js');

// discounts index listing
router.get('/', function(req, res) {
  var defaultSearch = {
    county : 'all',
    county : 'all',
    category : 'all',
    category : 'all',
    search : '',
    search : '',
    recent : '10'
  }
  var defaultQuery = discounts.filterDiscounts(defaultSearch);
  defaultQuery.then(function(result) {
   console.log(result) //will log results.
  })
  res.render('discounts');
});

// discounts searched/filtered
router.post('/', function(req, res) {
  console.log(req.body)
  var searchQuery = discounts.filterDiscounts(req.body);
  searchQuery.then(function(result) {
   console.log(result) //will log results.
  })
  res.render('discounts');
})

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

// Submit new veteran form
router.post('/veteran', function(req, res, next) {
  if (req.body.name === '' || req.body.email === '' || req.body.county === '') {
    res.redirect('/error')
  }
  var newVeteran = {
    name : req.body.name,
    email : req.body.email,
    county : req.body.county   
  }
  veterans.createHoldingVeteran(newVeteran);
  res.redirect('/discounts');
});

module.exports = router;