'use strict'
var passport = require('passport');
var LocalStrategy   = require('passport-local').Strategy;
var bcrypt = require('bcryptjs');
let db = require('../db.js');

module.exports = function(passport) {

  // used to serialize the user for the session
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser(function(id, done) {
    db.query("SELECT * from `admins` where `id` = ?", [id],function(err,rows){ 
      done(err, rows[0]);
    });
  });

  passport.use(new LocalStrategy(function(username, password, done) { 
    db.query("SELECT * FROM `admins` WHERE `username` = ?", [username], function(err,rows){
      bcrypt.compare(password, rows[0].password, function(err, res) {
        if (err) return done(err);
        if (res === false) {
          console.log("Incorrect Username or Password")
          return done(null, false);
        } else {
          console.log("Success!")
          return done(null, rows[0]);
        }
      });
    });
  }));

};