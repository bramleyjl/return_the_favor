'use strict';
var express = require('express');
var router = express.Router();

// events index
router.get('/', function(req, res, next) {
  res.render('events.hbs');
});

module.exports = router;