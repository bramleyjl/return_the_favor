'use strict';
var express = require('express');
var router = express.Router();
var discounts = require('../models/discounts.js');
var veterans = require('../models/veterans.js');

// discounts index listing
router.get('/', function(req, res) {
  var defaultSearch = {
    county : 'all',
    zip : '',
    category : 'all',
    search : '',
    recent : '10'
  }
  var defaultQuery = discounts.filterDiscounts(defaultSearch);
  defaultQuery.then(function(discounts) {
    res.render('discounts', {discounts : discounts});
  })
});

// discounts searched/filtered
router.post('/', function(req, res) {
  var searchParams = {
      county : req.body.county,
      zip : req.body.zip,
      category : req.body.category,
      recent : req.body.recent,
      search : req.body.search
  }
  var searchQuery = discounts.filterDiscounts(searchParams);
  searchQuery.then(function(discounts) {
    //query results pagination
    var totalDiscounts = discounts.length,
      pageSize = 2,
      pageCount = Math.ceil(discounts.length / pageSize),
      currentPage = 1,
      discountsArrays = [],
      discountsPresent = []
    //splits query results into groups per page
    while (discounts.length > 0) {
      discountsArrays.push(discounts.splice(0, pageSize));
    }
    //sets current page
    if (typeof req.query.page !== 'undefined') {
      currentPage = +parseInt(req.query.page);
    }
    //determines whether to show last or next page buttons
    if (currentPage !== 1) var lastPage = currentPage - 1
    if (currentPage !== pageCount) var nextPage = currentPage + 1
    discountsPresent = discountsArrays[+currentPage -1]; 
    res.render('discounts', {
      discounts : discountsPresent,
      searchParams : searchParams,
      currentPage : currentPage,
      lastPage : lastPage,
      nextPage : nextPage
    });
  }) 
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