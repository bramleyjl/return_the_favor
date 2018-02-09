'use strict';
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('home.hbs');
});

// alternate home page route
router.get('/home', function(req, res, next) {
  res.render('home.hbs');
});

//GET about page
router.get('/about', function(req, res, next) {
  res.render('about.hbs');
});

module.exports = router;