'use strict'
var mysql = require('mysql');
var settings = require('./config/config.json')

var connection = mysql.createConnection({
    host     : settings.db.host,
    port     : settings.db.port,
    user     : settings.db.user,
    password : settings.db.password,
    database : settings.db.database
});

connection.connect(function(err) {
  if ( err ) throw err
  console.log("Connected to database as " + connection.threadId)
});

module.exports = connection;