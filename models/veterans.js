'use strict'
let db = require('../db.js')

exports.createVeteran = function(name, email, county) {
  var newVeteran = {
    name : name,
    email : email,
    county : county
  }
  db.query("INSERT INTO `veterans` SET ?", [newVeteran], function (err, results, fields) {
    if (err) throw err;
    return results
  })
}