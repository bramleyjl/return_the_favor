'use strict';
var express = require('express');
var router = express.Router();
var discounts = require('../models/discounts.js');
var veterans = require('../models/veterans.js');

// discounts index listing
router.get('/', function(req, res) {
  var defaultSearch = {
    counties : 'all',
    zip : '',
    category : 'all',
    search : '',
    recent : '21'
  }
  var defaultQuery = discounts.filterDiscounts(defaultSearch);
  defaultQuery.then(function(results) {
    results = discounts.checkExpiration(results, "user")
    res.render('discounts', {discounts : results});
  })
});

// discounts searched/filtered
router.get('/filter', function(req, res) {
  var searchParams = {
      counties : req.query.county,
      zip : req.query.zip,
      category : req.query.category,
      recent : req.query.recent,
      search : req.query.search
  }
  var searchQuery = discounts.filterDiscounts(searchParams);
  searchQuery.then(function(results) {
    if (results.length === 0) {
      var noDiscounts = "true"
      res.render('discounts', {no_discounts: noDiscounts})
    } else {
      results = discounts.checkExpiration(results, "user");
      //query results pagination
      var totalDiscounts = results.length,
      pageSize = 50,
      pageCount = Math.ceil(results.length / pageSize),
      currentPage = 1,
      discountsArrays = [],
      discountsPresent = []
      //splits query results into groups per page
      while (results.length > 0) {
        discountsArrays.push(results.splice(0, pageSize));
      }
      //sets current page
      if (typeof req.query.page !== 'undefined') {
        currentPage = +parseInt(req.query.page);
      }
      //determines whether to show last or next page buttons
      if (currentPage !== 1) var lastPage = currentPage - 1
      if (currentPage !== pageCount && pageCount!== 0) var nextPage = currentPage + 1
      discountsPresent = discountsArrays[+currentPage -1];
      console.log(discountsPresent)
      res.render('discounts', {
        discounts : discountsPresent,
        searchParams : searchParams,
        currentPage : currentPage,
        lastPage : lastPage,
        nextPage : nextPage
      });
    }
  }); 
});

// single discount by id
router.get('/view/:id', function(req, res) {
  discounts.returnDiscountsById(req.params.id).then( function (discount) {
    res.render('discounts', {discounts : discount})
  }).catch( function (err) {
    if (err) res.redirect('/discounts');
  })  
});

// Submit new veteran form
router.post('/veteran', function(req, res) {
  var spamCheck = veterans.checkEmail(req.body.email)
  spamCheck.then(function (email) {
    if (email === undefined) {
      var newVeteran = {
        name : req.body.name,
        email : req.body.email,
        county : req.body.county   
      }
      veterans.createHoldingVeteran(newVeteran);
      res.redirect('/discounts/confirmation');
    } else {
      res.render('error', {
        message: `Duplicate Email`,
        error: {
          status: 422,
          stack: `We're sorry, ${email} is already registered in our database.`
        }
      })      
    }
  })

});

// confirmation after submitting a discount
router.get('/confirmation', function(req, res) {
  res.render('thanks', {veteran : true});
});

module.exports = router;