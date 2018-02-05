'use strict';
var express = require('express');
var veterans = require('../models/veterans.js');



var router = express.Router();

/* GET signups index. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Signups Index' });
});

/* GET veterans signup page. */
router.get('/veterans', function(req, res, next) {
  console.log(veterans.cowabungaDude())
  res.render('signup', { title: 'Veterans Signup' });
});

// Submit new veteran form
router.post('/veterans/new', function(req, res, next) {
  if (req.body.name === '' || req.body.email === '' || req.body.county === '') {
    res.redirect('/error')
  }
  
});

/* GET businesses signup page. */
router.get('/businesses', function(req, res, next) {
  res.send('Signups page for businesses');
});


module.exports = router;