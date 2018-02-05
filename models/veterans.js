'use strict';
let db = require('../db.js')

exports.cowabungaDude = function() {
  return db.query("SELECT * FROM `veterans`", function (err, results) {
    if (err) throw err
    return results 
  })
}
