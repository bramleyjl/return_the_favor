'use strict'
let db = require('../db.js');
let moment = require('moment');

//helper function to create variable length DB queries
var createInList = function(integer) {
  var inList = ''
  for (var i = integer.length - 1; i >= 0; i--) {
    inList += '?, ';
  }
  inList = inList.slice(0, 2);
  return inList
}

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
  return new Promise(function(resolve, reject) {
    db.query("SELECT * FROM `liveDiscounts_counties` WHERE `county_id` = ?",
      [params.county], function(err, results) {
        if (err) return reject(err);
        var inList = '';
        var queryParams = [];
        //if no discounts exist in selected county
        if (results.length === 0) {
          inList = '?';
          queryParams.push(0);
        } else {
          for (var i = results.length - 1; i >= 0; i--) {
            queryParams.push(results[i].discount_id);
            inList += '?, ';
          }
          inList = inList.slice(0, -2);
        }
        queryParams.push(params.category, params.category, params.state);
        db.query(
          "SELECT `discounts`.*, \
              GROUP_CONCAT(`liveDiscounts_counties`.`county_id` SEPARATOR ', ') AS `counties`, \
              GROUP_CONCAT(`counties`.`name` SEPARATOR ', ') AS `counties_names`, \
              `categories`.`name` AS `category_name`, \
              `states`.`abbreviation` AS `state_abv` \
              FROM `discounts` \
              JOIN `liveDiscounts_counties` ON `discounts`.`id` = `liveDiscounts_counties`.`discount_id` \
              JOIN `counties` ON `liveDiscounts_counties`.`county_id` = `counties`.`id` \
              JOIN `categories` ON `discounts`.`category` = `categories`.`id` \
              JOIN `states` ON `discounts`.`state` = `states`.`id` \
              WHERE `discounts`.`id` IN (" +inList +") \
              AND (`discounts`.`category` = ? OR ? = 'all') AND (`discounts`.`state` = ?) \
              GROUP BY `discounts`.`id` \
              ORDER BY `expiration` ASC",
          queryParams, function(err, results) {
            if (err) return reject(err);
            return resolve(results);
          }
        );
      }
    );
  });
};


//search for business by name (admin function)
exports.businessLookup = function(name) {
  return new Promise(function (resolve, reject) {
    db.query("SELECT \
      `discounts`.`id`, \
      `discounts`.`busname`, \
      `counties`.`name` AS `county_name` \
      FROM `discounts` \
      JOIN `counties` ON `discounts`.`county` = `counties`.`id` \
      WHERE `busname` LIKE "+ db.escape('%'+name+'%'), function (err, results) {
        if (err) return reject(err);
        return (resolve(results))
      }
    );
  });
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
      AND (((`busname`) LIKE "+ db.escape('%'+params.search+'%') + " OR (`desoffer`) LIKE " + db.escape('%'+params.search+'%') + ") OR ? = '') \
       ORDER BY `recent_display` DESC LIMIT ?",
    [params.county, params.county, 
      params.zip, params.zip, 
      params.category, params.category,
      params.search, params.recent], 
      function (err, results) {
        if (err) return reject(err);
        return (resolve(results))
      }
    );
  });  
}

//returns one or more discounts by an array of ids
exports.returnDiscountsById = function(ids) {
  //constructor for sql query to select the right number of results
  var inList = '';
  for (var i = ids.length - 1; i >= 0; i--) {
    inList += '?, ';
  }
  inList = inList.slice(0, -2);
  return new Promise(function (resolve, reject){ 
    db.query("SELECT `discounts`.*, \
      GROUP_CONCAT(`liveDiscounts_counties`.`county_id` SEPARATOR ', ') AS `counties`, \
      GROUP_CONCAT(`counties`.`name` SEPARATOR ', ') AS `counties_names`, \
      `categories`.`name` AS `category_name`, \
      `states`.`abbreviation` AS `state_abv` \
      FROM `discounts` \
      JOIN `liveDiscounts_counties` ON `discounts`.`id` = `liveDiscounts_counties`.`discount_id` \
      JOIN `counties` ON `liveDiscounts_counties`.`county_id` = `counties`.`id` \
      JOIN `categories` ON `discounts`.`category` = `categories`.`id` \
      JOIN `states` ON `discounts`.`state` = `states`.`id` \
      WHERE `discounts`.`id` IN (" + inList + ") GROUP BY `discounts`.`id`", ids, function(err, results) {
      if (err) return reject(err);
      return (resolve(results))
    });
  });
}

//updates discount in live table
exports.updateDiscount = function(params) {
  //turn Handlebars' parsed timestamps back into SQL-ready timestamps
  params.expiration = moment(params.expiration, "MM-DD-YYYY").format("YYYY-MM-DD HH:mm:ss")
  return new Promise(function (resolve, reject) {
      db.query("UPDATE `discounts` \
      SET `busname` = ?, \
      `state` = ?, \
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
        if (err) return reject(err);
        return resolve(results)
      })
  });
}

//adds and/or deletes corresponding liveDiscounts_counties rows to match discounts updates
exports.updateDiscountCounties = function(params) {
  return new Promise(function (resolve, reject) {
    db.query("SELECT * FROM `liveDiscounts_counties` WHERE `discount_id` = ?", 
      [params.id], function(err, results) {
      if (err) return reject(err);
      var removalQueue = [];
      var additionQueue = [];
      var databaseCounties = [];
      for (var i = results.length - 1; i >= 0; i--) {
        databaseCounties.push(results[i].county_id)
        if (params.counties.indexOf(results[i].county_id) === -1) removalQueue.push([params.id, results[i].county_id])
      }
      for (var j = params.counties.length - 1; j >= 0; j--) {
        if (databaseCounties.indexOf(params.counties[j]) === -1) additionQueue.push([parseInt(params.id), parseInt(params.counties[j])])
      }
      db.query("DELETE FROM `liveDiscounts_counties` WHERE (`discount_id`, `county_id`) IN (?)", 
        [removalQueue], function(err, results) {
          if (err) return reject(err)
          console.log(results)
          db.query("INSERT INTO `liveDiscounts_counties` (`discount_id`, `county_id`) VALUES ?", [additionQueue], function(err, results) {
            if (err) return reject(err)
            console.log(results)
            return resolve(results)
          })
      })
    })
  })
}

//makes discount most visibile on discounts page
exports.bumpToRecent = function(id) {
  var now = moment.utc().format("YYYY-MM-DD HH:mm:ss")
  return new Promise(function (resolve, reject) {
    db.query("UPDATE `discounts` \
    SET `discounts`.`recent_display` = ? \
    WHERE `id` = ?", [now, id], function (err, results) {
      if (err) return reject(err);
      return resolve(results)
    });
  });
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

//checks if discounts are expired and either returns their status or drops them from the object
exports.checkExpiration = function(discounts, caller) {
  for (var i = discounts.length - 1; i >= 0; i--) {
    if (discounts[i].expiration <= moment()) {
      //for admin use, flags discount as expired
      if (caller === "admin") {
        discounts[i].active = "Expired"
      //for user use, filters out discount from query results
      } else if (caller === "user") {
        discounts.splice(i, 1);
      }
    //for admin use, flags discount as active (no need to do anything for users)
    } else {
      discounts[i].active = "Active"
    }
  }
  return discounts
}

////////beginning of 'holding_discounts' functions////////

//inserts submitted discount into the holding table for review
exports.createHoldingDiscount = function(discount, counties) {
  var currentTime =  moment(new Date());
  discount.expiration = moment(currentTime).add({months:discount.expiration}).format("YYYY-MM-DD HH:mm:ss");
  db.query("INSERT INTO `holding_discounts` SET ?", [discount], function (err, results, fields) {
    if (err) throw err;
    for (var i = counties.length - 1; i >= 0; i--) {
      var discountCounty = {discount_id: results.insertId, county_id: counties[i]}
      db.query("INSERT INTO `holdingDiscounts_counties` SET ?", [discountCounty], function (err, results) {
        if (err) throw err;
        return results
      });
    }
  });
}

//returns the entire discounts holding table
exports.returnAllHoldingDiscounts = function() {
  return new Promise(function (resolve, reject) {
    db.query("SELECT `holding_discounts`.*, \
      GROUP_CONCAT(`holdingDiscounts_counties`.`county_id` SEPARATOR ', ') AS `counties`, \
      GROUP_CONCAT(`counties`.`name` SEPARATOR ', ') AS `counties_names`, \
      `categories`.`name` AS `category_name`, \
      `states`.`abbreviation` AS `state_abv` \
      FROM `holding_discounts`\
      JOIN `holdingDiscounts_counties` ON `holding_discounts`.`id` = `holdingDiscounts_counties`.`discount_id` \
      JOIN `counties` ON `holdingDiscounts_counties`.`county_id` = `counties`.`id` \
      JOIN `categories` ON `holding_discounts`.`category` = `categories`.`id` \
      JOIN `states` ON `holding_discounts`.`state` = `states`.`id` \
      GROUP BY `holding_discounts`.`id`", 
    function (err, results, fields) {
      if (err) return reject(err);
      return resolve(results)
    });
  });
}

//returns all counties linked to discount by id
exports.returnDiscountCounties = function(id) {
  console.log(id)
  return new Promise(function (resolve, reject) {
    db.query("SELECT * FROM `holdingDiscounts_counties` WHERE `discount_id` = ?", [id], function (err, results) {
      if (err) return reject(err);
      console.log(results)
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
exports.validateHoldingDiscount = function(params, counties) {
  //turn Handlebars' parsed timestamps back into SQL-ready timestamps
  params.created = (params.created).substring(4, 24)
  params.created = moment(params.created, "MMM-DD-YYYY HH:mm:ss").format("YYYY-MM-DD HH:mm:ss")
  params.expiration = moment(params.expiration, "MM-DD-YYYY").format("YYYY-MM-DD HH:mm:ss")
  return new Promise(function (resolve, reject) {
    db.query("INSERT INTO `discounts` SET ?", [params], function (err, results, fields) {
      if (err) return reject(err);
      console.log(results)
      //pull all county ids and create a new liveDiscounts_counties row from each
      for (var i = counties.length - 1; i >= 0; i--) {
        var discountCounty = {discount_id: results.insertId, county_id: counties[i].county_id}
        console.log(discountCounty)
        db.query("INSERT INTO `liveDiscounts_counties` SET ?", [discountCounty], function (err, results) {
          if (err) throw err;
          console.log(results)
          return resolve (results)
        });
      }
    });
  });
}