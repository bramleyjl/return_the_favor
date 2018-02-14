'use strict'
let db = require('../db.js')

//inserts a new veteran into holding table
exports.createVeteran = function(params) {
  db.query("INSERT INTO `holding_veterans` SET ?", [params], function (err, results, fields) {
    if (err) throw err;
    return results
  })
}

//returns the entire veterans holding table
exports.returnAllHolding = function() {
  return new Promise(function (resolve, reject) {
    db.query("SELECT * FROM `holding_veterans`", function (err, results, fields) {
      if (err) return reject(err);
      return resolve(results)
    });
  });
}

//deletes discount from holding table by id
exports.deleteHoldingDiscount = function(id) {
  return new Promise(function (resolve, reject) {
    db.query("DELETE FROM `holding_veterans` WHERE id = ?", [id], function (err, results) {
      if (err) return reject(err);
      return resolve(results)
    });
  });
}

//updates discount in holding table
exports.updateHoldingDiscount = function(params) {
  db.query("UPDATE `holding_veterans` \
    SET `name` = ?, \
    `email` = ?, \
    `county` = ? \
    WHERE `id` = ?", [
    params.name, 
    params.email,
    params.county,
    params.id
    ], function (err, results) {
      if (err) throw err
      console.log(results)
  })
}

//creates new row in discount table and removes identical holding table row
exports.validateHoldingDiscount = function(params) {
  //turn Handlebars' parsed timestamps back into SQL-ready timestamps
  return new Promise(function (resolve, reject) {
    db.query("INSERT INTO `veterans` SET ?", [params], function (err, results, fields) {
      if (err) return reject(err);
      return resolve(results)
    });
  });
}