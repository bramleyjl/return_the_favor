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

//returns all discounts based on cateogry id
exports.returnDiscountsByCategory = function(category) {
  return new Promise(function (resolve, reject) {
    db.query("SELECT *, `categories`.`name` FROM `discounts` JOIN `categories` ON `discounts`.`category` = `categories`.`id` WHERE `category` = ?", [category], function (err, results) {
      if (err) return reject(err);
      return (resolve(results))
    });
  });
}

//returns all discounts based on cateogry id
exports.returnDiscountsByCounty = function(county) {
  return new Promise(function (resolve, reject) {
    db.query("SELECT *, `counties`.`name` FROM `discounts` JOIN `counties` ON `discounts`.`county` = `counties`.`id` WHERE `county` = ?", [county], function (err, results) {
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