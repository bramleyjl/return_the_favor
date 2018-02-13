'use strict';
var express = require('express');
var router = express.Router();
var discounts = require('../models/discounts.js');
var veterans = require('../models/veterans.js');

//admin home page
router.get('/', function(req, res, next) {
  var holdingTable = discounts.returnAllHolding()
  holdingTable.then(function(result) {
    res.render('admin', { holding: result });
  })
});

//delete row from holding_discounts
router.post('/holding_discounts/delete', function(req, res) {
  discounts.deleteHoldingDiscount(req.body.id)
  res.redirect('/admin')
});

module.exports = router;