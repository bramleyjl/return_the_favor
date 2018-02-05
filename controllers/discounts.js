'use strict';
var express = require('express');

var router = express.Router();

/* GET discounts listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* GET discounts by category */
router.get('/categories/:slug', function(req, res, next) {
  res.send(`Discounts in the ${req.params.slug} category`);
});

/* GET discounts by county */
router.get('/counties/:slug', function(req, res, next) {
  res.send(`Discounts in ${req.params.slug} county`);
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