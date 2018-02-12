'use strict'
let db = require('../db.js');
let moment = require('moment');

//returns an object with all discounts
exports.returnAllDiscounts = function() {
  return new Promise(function (resolve, reject) {
    db.query("SELECT * FROM `discounts`", function (err, results, fields) {
      if (err) return reject(err);
      return resolve(results)
    });
  });
}

//master filter function, combines multiple filtering/searching options
exports.filterDiscounts = function(params) {
  params.recent = parseInt(params.recent)
  return new Promise(function (resolve, reject) {
    db.query("SELECT * FROM `discounts` \
      WHERE (`county` = ? OR ? = 'all') \
      AND (`category` = ? OR ? = 'all') \
      AND (MATCH (`busname`, `desoffer`) AGAINST (?) OR ? = '') \
      ORDER BY `created` DESC LIMIT ?",
      [params.county, params.county, params.category, params.category, params.search, params.search, params.recent], function (err, results) {
      if (err) return reject(err);
      return (resolve(results))
    });
  });  
}

//returns single discount by querying its id
exports.returnDiscountsById = function(id) {
  return new Promise(function (resolve, reject) {
    db.query("SELECT * FROM `discounts` WHERE `id` = ?", [id], function (err, results) {
      if (err) return reject(err);
      return (resolve(results))
    });
  });
}

//inserts submitted discount into the holding table for review
exports.createDiscount = function(params) {
  var discount = params;
  var currentTime =  moment(new Date());
  discount.expiration = moment(currentTime).add({months:discount.expiration}).format("YYYY-MM-DD HH:mm:ss");
  db.query("INSERT INTO `holding_discounts` SET ?", [discount], function (err, results, fields) {
    if (err) throw err;
    return results
  });
}

//returns the entire discounts holding table
exports.returnAllHolding = function() {
  return new Promise(function (resolve, reject) {
    db.query("SELECT * FROM `holding_discounts`", function (err, results, fields) {
      if (err) return reject(err);
      return resolve(results)
    });
  });
}