'use strict'
let db = require('../db.js')

////////beginning of 'live_veterans' functions////////

//inserts a new veteran into holding table
exports.createLiveVeteran = function(params) {
  db.query("INSERT INTO `veterans` SET ?", [params], function (err, results, fields) {
    if (err) throw err;
    return results
  })
}

//returns an object with all veterans
exports.returnAllVeterans = function() {
  return new Promise(function (resolve, reject) {
    db.query("SELECT \
    `veterans`.`id`, \
    `veterans`.`name`, \
    `veterans`.`email`, \
    `veterans`.`county`, \
    `counties`.`name` AS `county_name` \
    FROM `veterans` \
    JOIN `counties` ON `veterans`.`county` = `counties`.`id`", 
    function (err, results, fields) {
      if (err) return reject(err);
      return resolve(results)
    });
  });
}

//updates veteran in live table
exports.updateLiveVeteran = function(params) {
  db.query("UPDATE `veterans` \
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

//deletes veteran from live table by id
exports.deleteLiveVeteran = function(id) {
  return new Promise(function (resolve, reject) {
    db.query("DELETE FROM `veterans` WHERE id = ?", [id], function (err, results) {
      if (err) return reject(err);
      return resolve(results)
    });
  });
}

//search for veteran by email (admin function)
exports.veteranLookup = function(email) {
  return new Promise(function (resolve, reject) {
    db.query("SELECT \
      `veterans`.`id`, \
      `veterans`.`name`, \
      `veterans`.`county`, \
      `veterans`.`email`, \
      `counties`.`name` AS `county_name` \
      FROM `veterans` \
      JOIN `counties` ON `veterans`.`county` = `counties`.`id` \
      WHERE `email` = ?", [email], function (err, results) {
        if (err) return reject(err);
        return (resolve(results))
      }
    );
  });
}

////////beginning of 'holding_veterans' functions////////

//inserts a new veteran into holding table
exports.createHoldingVeteran = function(params) {
  db.query("INSERT INTO `holding_veterans` SET ?", [params], function (err, results, fields) {
    if (err) throw err;
    return results
  })
}

//returns the entire veterans holding table
exports.returnAllHoldingVeterans = function() {
  return new Promise(function(resolve, reject) {
    db.query("SELECT \
    `holding_veterans`.`id`, \
    `holding_veterans`.`name`, \
    `holding_veterans`.`email`, \
    `holding_veterans`.`county`, \
    `counties`.`name` AS `county_name` \
    FROM `holding_veterans` \
    JOIN `counties` ON `holding_veterans`.`county` = `counties`.`id`", 
    function (err, results, fields) {
      if (err) return reject(err);
      return resolve(results);
    });
  })
}

//updates veteran in holding table
exports.updateHoldingVeteran = function(params) {
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

//deletes veteran from holding table by id
exports.deleteHoldingVeteran = function(id) {
  return new Promise(function (resolve, reject) {
    db.query("DELETE FROM `holding_veterans` WHERE id = ?", [id], function (err, results) {
      if (err) return reject(err);
      return resolve(results)
    });
  });
}

//creates new row in veteran table and removes identical holding table row
exports.validateHoldingVeteran = function(params) {
  //turn Handlebars' parsed timestamps back into SQL-ready timestamps
  return new Promise(function (resolve, reject) {
    db.query("INSERT INTO `veterans` SET ?", [params], function (err, results, fields) {
      if (err) return reject(err);
      return resolve(results)
    });
  });
}