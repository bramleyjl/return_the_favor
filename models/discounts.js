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
              GROUP_CONCAT(`liveDiscounts_counties`.`county_id` SEPARATOR ', ') AS `county_ids`, \
              GROUP_CONCAT(`counties`.`name` SEPARATOR ', ') AS `county_names`, \
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
            for (var i = results.length - 1; i >= 0; i--) {
              if (results[i].county_ids.length > 1) {
                results[i].county_ids = results[i].county_ids.split(',').map(Number);
                results[i].county_names = results[i].county_names.split(',');
              } else {
                results[i].county_ids = [parseInt(results[i].county_ids)]
                results[i].county_names = [results[i].county_names]
              }
              results[i].counties = []
              for (var j = results[i].county_ids.length - 1; j >= 0; j--) {
                results[i].counties.push({
                  id: results[i].county_ids[j],
                  name: results[i].county_names[j]
                })
              } 
            }
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
      `discounts`.`busname` \
      FROM `discounts` \
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
  return new Promise(function(resolve, reject) {
  db.query("SELECT * FROM `liveDiscounts_counties` WHERE (`county_id` = ? OR ? = 'all')",
    [params.counties, params.counties], function(err, results) {
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
      queryParams.push(
        params.zip, params.zip, 
        params.category, params.category, 
        params.search, 
        params.recent);
      db.query("SELECT `discounts`.*, \
        GROUP_CONCAT(`liveDiscounts_counties`.`county_id` SEPARATOR ', ') AS `county_ids`, \
        GROUP_CONCAT(`counties`.`name` SEPARATOR ', ') AS `county_names`, \
        `categories`.`name` AS `category_name`, \
        `states`.`abbreviation` AS `state_abv` \
        FROM `discounts` \
        JOIN `liveDiscounts_counties` ON `discounts`.`id` = `liveDiscounts_counties`.`discount_id` \
        JOIN `counties` ON `liveDiscounts_counties`.`county_id` = `counties`.`id` \
        JOIN `categories` ON `discounts`.`category` = `categories`.`id` \
        JOIN `states` ON `discounts`.`state` = `states`.`id` \
        WHERE `discounts`.`id` IN (" + inList +") \
        AND (`zip` = ? OR ? = '') \
        AND (`discounts`.`category` = ? OR ? = 'all') \
        AND (((`busname`) LIKE "+ db.escape('%'+params.search+'%') + " OR (`desoffer`) LIKE " + db.escape('%'+params.search+'%') + ") OR ? = '') \
        GROUP BY `discounts`.`id` \
        ORDER BY `recent_display` DESC LIMIT ?",
        queryParams, 
        function (err, results) {
          if (err) return reject(err);
          for (var i = results.length - 1; i >= 0; i--) {
            if (results[i].county_ids.length > 1) {
              results[i].county_ids = results[i].county_ids.split(',').map(Number);
              results[i].county_names = results[i].county_names.split(',');
            } else {
              results[i].county_ids = [parseInt(results[i].county_ids)]
              results[i].county_names = [results[i].county_names]
            }
            results[i].counties = []
            for (var j = results[i].county_ids.length - 1; j >= 0; j--) {
              results[i].counties.push({
                id: results[i].county_ids[j],
                name: results[i].county_names[j]
              })
            }            
          }
          return (resolve(results))
        }
      );
    });  
  });
}

//returns one or more discounts by an array of ids
exports.returnDiscountsById = function(ids) {
  //constructor for sql query to select the right number of results
  if (typeof(ids) === "string") ids = [ids]
  var inList = '';
  for (var i = ids.length - 1; i >= 0; i--) {
    inList += '?, ';
  }
  inList = inList.slice(0, -2);
  return new Promise(function (resolve, reject){ 
    db.query("SELECT `discounts`.*, \
      GROUP_CONCAT(`liveDiscounts_counties`.`county_id` SEPARATOR ', ') AS `county_ids`, \
      GROUP_CONCAT(`counties`.`name` SEPARATOR ', ') AS `county_names`, \
      `categories`.`name` AS `category_name`, \
      `states`.`abbreviation` AS `state_abv` \
      FROM `discounts` \
      JOIN `liveDiscounts_counties` ON `discounts`.`id` = `liveDiscounts_counties`.`discount_id` \
      JOIN `counties` ON `liveDiscounts_counties`.`county_id` = `counties`.`id` \
      JOIN `categories` ON `discounts`.`category` = `categories`.`id` \
      JOIN `states` ON `discounts`.`state` = `states`.`id` \
      WHERE `discounts`.`id` IN (" + inList + ") \
      GROUP BY `discounts`.`id` \
      ORDER BY `expiration` ASC", ids, function(err, results) {
      if (err) return reject(err);
      for (var i = results.length - 1; i >= 0; i--) {
        if (results[i].county_ids.length > 1) {
          results[i].county_ids = results[i].county_ids.split(',').map(Number);
          results[i].county_names = results[i].county_names.split(',');
        } else {
          results[i].county_ids = [parseInt(results[i].county_ids)]
          results[i].county_names = [results[i].county_names]
        }
        results[i].counties = []
        for (var j = results[i].county_ids.length - 1; j >= 0; j--) {
          results[i].counties.push({
            id: results[i].county_ids[j],
            name: results[i].county_names[j]
          })
        }
      }
      return (resolve(results))
    });
  });
}

//updates discount in live table
exports.updateDiscount = function(params) {
  //turn Handlebars' parsed timestamps back into SQL-ready timestamps
  var expirationTimestamp = moment(params.expiration, "MM-DD-YYYY").format("YYYY-MM-DD HH:mm:ss")
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
      expirationTimestamp,
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
      //converts params.counties to an array of integers
      if (params.counties.length > 1) {
        if (typeof(params.counties) === 'object' && params.counties[0].length > 1) {
          var firstCounties = params.counties.shift()
          params.counties = firstCounties.split(',').concat(params.counties)
        } else if (typeof(params.counties) === 'string') {
          params.counties = params.counties.split(',')
        }
        params.counties = params.counties.map(Number);
      } else {
        params.counties = [parseInt(params.counties)]
      }
      var removalQueue = [];
      var additionQueue = [];
      var databaseCounties = [];
      for (var i = results.length - 1; i >= 0; i--) {
        databaseCounties.push(results[i].county_id)
        if (params.counties.indexOf(results[i].county_id) === -1) removalQueue.push([params.id, results[i].county_id])
      }
      for (var j = params.counties.length - 1; j >= 0; j--) {    
        if (databaseCounties.indexOf(params.counties[j]) === -1) additionQueue.push([params.id, params.counties[j]])
      }
      if (removalQueue.length > 0) {
        db.query("DELETE FROM `liveDiscounts_counties` WHERE (`discount_id`, `county_id`) IN (?)", 
        [removalQueue], function(err, results) {
          if (err) return reject(err)
          return resolve(results)
      })
      }
      if (additionQueue.length > 0) {
        db.query("INSERT INTO `liveDiscounts_counties` (`discount_id`, `county_id`) VALUES ?", 
        [additionQueue], function(err, results) {
          if (err) return reject(err)
          return resolve(results)
        })
      }
      return resolve(results)
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
      GROUP_CONCAT(`holdingDiscounts_counties`.`county_id` SEPARATOR ', ') AS `county_ids`, \
      GROUP_CONCAT(`counties`.`name` SEPARATOR ', ') AS `county_names`, \
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
      for (var i = results.length - 1; i >= 0; i--) {
        if (results[i].county_ids.length > 1) {
          results[i].county_ids = results[i].county_ids.split(',').map(Number);
          results[i].county_names = results[i].county_names.split(',');
        } else {
          results[i].county_ids = [parseInt(results[i].county_ids)]
          results[i].county_names = [results[i].county_names]
        }
        results[i].counties = []
        for (var j = results[i].county_ids.length - 1; j >= 0; j--) {
          results[i].counties.push({
            id: results[i].county_ids[j],
            name: results[i].county_names[j]
          })
        }
      }
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
  //converts params.counties to an array of integers
  //then stashes & deletes it so the new discount row can be created
  if (params.counties.length > 1) {
    if (typeof(params.counties) === 'object' && params.counties[0].length > 1) {
      var firstCounties = params.counties.shift()
      params.counties = firstCounties.split(',').concat(params.counties)
    } else if (typeof(params.counties) === 'string') {
      params.counties = params.counties.split(',')
    }
    params.counties = params.counties.map(Number);
  } else {
    params.counties = [parseInt(params.counties)]
  }
  var counties = params.counties
  delete params.counties
  //turn Handlebars' parsed timestamps back into SQL-ready timestamps
  params.created = (params.created).substring(4, 24)
  params.created = moment(params.created, "MMM-DD-YYYY HH:mm:ss").format("YYYY-MM-DD HH:mm:ss")
  params.expiration = moment(params.expiration, "MM-DD-YYYY").format("YYYY-MM-DD HH:mm:ss")
  return new Promise(function (resolve, reject) {
    db.query("INSERT INTO `discounts` SET ?", [params], function (err, results, fields) {
      if (err) return reject(err);
      //pull all county ids and create an object to make liveDiscounts_counties rows with
      var countyRows = []
      for (var i = counties.length - 1; i >= 0; i--) {
        countyRows.push([results.insertId, counties[i]])
      }
      db.query("INSERT INTO `liveDiscounts_counties` (`discount_id`, `county_id`) VALUES ?", 
      [countyRows], function(err, results) {
          if (err) return reject(err)
          return resolve(results)
      });
    });
  });
}

//checks submitted discount's email against all discounts in database to prevent spam
exports.checkEmail = function(email) {
  return new Promise(function (resolve, reject) {
    db.query("SELECT `busmail` FROM `holding_discounts` WHERE `busmail` = ?", [email], function (err, results) {
      if (err) return reject(err)
      if (results.length === 0) {  
        return resolve()
      } else {
      return resolve(results[0].busmail)
      }
    })
  })
}