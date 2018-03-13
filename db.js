'use strict'
var mysql = require('mysql');
var settings = require('./config/config.json')

console.log('process.env not in use', process.env.DB_HOST)

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').load();
}

console.log('process.env in use!', process.env.DB_HOST)

var connection = mysql.createConnection({
    host     : process.env.DB_HOST,
    port     : process.env.DB_PORT,
    user     : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : process.env.DATABASE
});

connection.connect(function(err) {
  if ( err ) throw err
  console.log("Connected to database as " + connection.threadId)
});

module.exports = connection;