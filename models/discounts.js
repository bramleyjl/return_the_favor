'use strict'
let db = require('../db.js');

exports.returnAllDiscounts = function() {
  return new Promise(function (resolve, reject) {
    db.query("SELECT * FROM `discounts`", function (err, results, fields) {
      if (err) return reject(err);
      return resolve(results);
    });
  });
};

//Inserts submitted discount into the holding table for review
exports.createDiscount = function( discount) {
    db.query("INSERT INTO `holding_discounts` SET ?", [discount], function (err, results, fields) {
      if (err) throw err;
      return results
    })
}