var express = require('express');
var router = express.Router();

/* GET signups index. */
router.get('/', function(req, res, next) {
  res.send('Signups index');
});

/* GET veterans signup page. */
router.get('/veterans', function(req, res, next) {
  res.send('Signups page for veterans');
});

/* GET businesses signup page. */
router.get('/businesses', function(req, res, next) {
  res.send('Signups page for businesses');
});

module.exports = router;
