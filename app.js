var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var nodemon = require('nodemon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require( './config/config.json' );
var helmet = require('helmet');
var session = require('express-session');
var passport = require('passport');
var passportConfig = require('./config/passport');
var flash = require('express-flash');

var indexController = require('./controllers/index');
var discountsController = require('./controllers/discounts');
var supportController = require('./controllers/support');
var eventsController = require('./controllers/events');
var adminController = require('./controllers/admin');

var app = express();

//passport & flash messages
passportConfig(passport)
app.use(session({ 
  secret: "jokerandthethief",
  resave: false,
  saveUninitialized: false, 
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// view engine setup
var handlebars = require('hbs');
handlebars.registerHelper('dateFormat', require('handlebars-dateformat'));
handlebars.registerPartials(__dirname + '/views/partials');
handlebars.registerHelper('json', function(context) {return JSON.stringify(context)});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(favicon(path.join(__dirname, 'public/images', 'favicon.png')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(helmet());

// call controllers
app.use('/', indexController);
app.use('/discounts', discountsController);
app.use('/support', supportController);
app.use('/events', eventsController);
app.use('/admin', adminController);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.listen( {
    port: config.port
}, function () {
    console.log( `Listening on port ${config.port}.` );
} ).on( 'error', function ( err ) {
    if ( err ) {
        console.log( `Couldn't listen on port ${config.port}. (Run as root?)` );
    }
} );

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;