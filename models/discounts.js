'use strict'
let db = require('../db.js');
let moment = require('moment');

////////beginning of 'live_discounts' functions////////

//inserts submitted discount into the live table
exports.createDiscount = function(params) {
  var discount = params;
  var currentTime =  moment(new Date());
  discount.expiration = moment(currentTime).add({months:discount.expiration}).format("YYYY-MM-DD HH:mm:ss");
  db.query("INSERT INTO `discounts` SET ?", [discount], function (err, results, fields) {
    if (err) throw err;
    return results
  });
}

//returns an object with all discounts
exports.returnAllDiscounts = function() {
  return new Promise(function (resolve, reject) {
    db.query("SELECT \
      `discounts`.*, \
      `counties`.`name` AS `county_name`, \
      `categories`.`name` AS `category_name`, \
      `states`.`name` AS `state_name` \
      FROM `discounts`\
      JOIN `counties` ON `discounts`.`county` = `counties`.`id` \
      JOIN `categories` ON `discounts`.`category` = `categories`.`id` \
      JOIN `states` ON `discounts`.`state` = `states`.`id`",  
    function (err, results, fields) {
      if (err) return reject(err);
      return resolve(results)
    });
  });
}

//admin filter function, combines multiple filter options
exports.adminFilterDiscounts = function(params) {
  return new Promise(function (resolve, reject) {
    db.query("SELECT \
      `discounts`.*, \
      `counties`.`name` AS `county_name`, \
      `categories`.`name` AS `category_name`, \
      `states`.`name` AS `state_name` \
      FROM `discounts` \
      JOIN `counties` ON `discounts`.`county` = `counties`.`id` \
      JOIN `categories` ON `discounts`.`category` = `categories`.`id` \
      JOIN `states` ON `discounts`.`state` = `states`.`id` \
      WHERE (`county` = ? OR ? = 'all') \
      AND (`category` = ? OR ? = 'all') \
      AND (`discounts`.`state` = ?) \
      ORDER BY `expiration` ASC",
      [params.county, params.county,
      params.category, params.category,
      params.state], 
      function(err, results) {
        if (err) return reject(err);
        return (resolve(results))
      }
    );
  })
}

//sorting function for live discounts by expiration date
exports.sortDiscounts = function(discounts, order) {
  if (order === "ascending") {
    return discounts.sort(function(a, b){
      return a.expiration > b.expiration
    })
  } else if (order === "descending") {
    return discounts.sort(function(a, b) {
      return a.expiration < b.expiration
    })
  }
}

//public filter function, combines multiple filtering/searching options
exports.filterDiscounts = function(params) {
  params.recent = parseInt(params.recent)
  return new Promise(function (resolve, reject) {
    db.query("SELECT \
      `discounts`.*, \
      `counties`.`name` AS `county_name`, \
      `categories`.`name` AS `category_name`, \
      `states`.`name` AS `state_name` \
      FROM `discounts` \
      JOIN `counties` ON `discounts`.`county` = `counties`.`id` \
      JOIN `categories` ON `discounts`.`category` = `categories`.`id` \
      JOIN `states` ON `discounts`.`state` = `states`.`id` \
      WHERE (`county` = ? OR ? = 'all') \
      AND (`zip` = ? OR ? = '') \
      AND (`category` = ? OR ? = 'all') \
      AND (MATCH (`busname`, `desoffer`) AGAINST (?) OR ? = '') \
      ORDER BY `created` DESC LIMIT ?",
    [params.county, params.county, 
      params.zip, params.zip, 
      params.category, params.category, 
      params.search, params.search, 
      params.recent], function (err, results) {
        if (err) return reject(err);
        return (resolve(results))
      }
    );
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

//updates discount in live table
exports.updateDiscount = function(params) {
  //turn Handlebars' parsed timestamps back into SQL-ready timestamps
  params.expiration = moment(params.expiration, "MM-DD-YYYY").format("YYYY-MM-DD HH:mm:ss")
  db.query("UPDATE `discounts` \
    SET `busname` = ?, \
    `state` = ?, \
    `county` = ?, \
    `zip` = ?, \
    `street` = ?, \
    `buslinks` = ?, \
    `category` = ?, \
    `desoffer` = ?, \
    `cname` = ?, \
    `cphone` = ?, \
    `busmail` = ?, \
    `notes` = ?, \
    `expiration` = ? \
    WHERE `id` = ?", [
    params.busname, 
    params.state,
    params.county,
    params.zip,
    params.street,
    params.buslinks,
    params.category,
    params.desoffer,
    params.cname,
    params.cphone,
    params.busmail,
    params.notes,
    params.expiration,
    params.id
    ], function (err, results) {
      if (err) throw err
      console.log(results)
  })
}

//deletes discount from live table by id
exports.deleteDiscount = function(id) {
  return new Promise(function (resolve, reject) {
    db.query("DELETE FROM `discounts` WHERE id = ?", [id], function (err, results) {
      if (err) return reject(err);
      return resolve(results)
    });
  });
}

////////beginning of 'holding_discounts' functions////////

//inserts submitted discount into the holding table for review
exports.createHoldingDiscount = function(params) {
  var discount = params;
  var currentTime =  moment(new Date());
  discount.expiration = moment(currentTime).add({months:discount.expiration}).format("YYYY-MM-DD HH:mm:ss");
  db.query("INSERT INTO `holding_discounts` SET ?", [discount], function (err, results, fields) {
    if (err) throw err;
    return results
  });
}

//returns the entire discounts holding table
exports.returnAllHoldingDiscounts = function() {
  return new Promise(function (resolve, reject) {
    db.query("SELECT \
      `holding_discounts`.*, \
      `counties`.`name` AS `county_name`, \
      `categories`.`name` AS `category_name`, \
      `states`.`name` AS `state_name` \
      FROM `holding_discounts`\
      JOIN `counties` ON `holding_discounts`.`county` = `counties`.`id` \
      JOIN `categories` ON `holding_discounts`.`category` = `categories`.`id` \
      JOIN `states` ON `holding_discounts`.`state` = `states`.`id`", 
    function (err, results, fields) {
      if (err) return reject(err);
      return resolve(results)
    });
  });
}

//deletes discount from holding table by id
exports.deleteHoldingDiscount = function(id) {
  return new Promise(function (resolve, reject) {
    db.query("DELETE FROM `holding_discounts` WHERE id = ?", [id], function (err, results) {
      if (err) return reject(err);
      return resolve(results)
    });
  });
}

//creates new row in discount table and removes identical holding table row
exports.validateHoldingDiscount = function(params) {
  //turn Handlebars' parsed timestamps back into SQL-ready timestamps
  params.created = (params.created).substring(4, 24)
  params.created = moment(params.created, "MMM-DD-YYYY HH:mm:ss").format("YYYY-MM-DD HH:mm:ss")
  params.expiration = moment(params.expiration, "MM-DD-YYYY").format("YYYY-MM-DD HH:mm:ss")
  return new Promise(function (resolve, reject) {
    db.query("INSERT INTO `discounts` SET ?", [params], function (err, results, fields) {
      if (err) return reject(err);
      return resolve(results)
    });
  });
}