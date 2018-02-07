'use strict';
var express = require('express');
var router = express.Router();

//admin home page
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Admin Index' });
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