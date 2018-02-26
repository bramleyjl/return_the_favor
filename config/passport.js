var passport = require('passport');
var LocalStrategy   = require('passport-local').Strategy;
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
      if (err) {
        console.log("Error!")
        return done(err);
      }
      if (rows.length === 0) {
        console.log("Incorrect Username")
        return done(null, false); 
      } 
      if (rows[0].password !== password) {
        console.log("Incorrect Password!")
        return done(null, false);      
      }
      console.log("Success!")
      return done(null, rows[0]);     
    });
  }));

};