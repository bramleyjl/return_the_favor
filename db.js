'use strict'
var mysql = require('mysql');

var connection = mysql.createConnection({
    host     : '165.227.193.154',
    port     : 3306,
    user     : 'john',
    password : 'devpass',
    database : 'return_the_favor'
});

connection.connect(function(err) {
  if ( err ) throw err
  console.log("Connected to database...")
});

module.exports = connection;