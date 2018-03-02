'use strict';
var express = require('express');
var router = express.Router();
var veterans = require('../models/veterans.js');

// events index
router.get('/', function(req, res, next) {
  res.render('events.hbs');
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
  res.redirect('/events');
});

module.exports = router;