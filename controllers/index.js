var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Return the Favor' });
});

/* GET about page. */
router.get('/about', function(req, res, next) {
  res.render('index', { title: 'About Page' });
});

/* GET resources page. */
router.get('/resources', function(req, res, next) {
  res.render('index', { title: 'Resources Page' });
});

/* GET opportunities page. */
router.get('/opportunities', function(req, res, next) {
  res.render('index', { title: 'Opportunities Page' });
});

/* GET contact page. */
router.get('/contact', function(req, res, next) {
  res.render('index', { title: 'Contact Page' });
});

module.exports = router;
