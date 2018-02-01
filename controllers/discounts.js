var express = require('express');
var router = express.Router();

/* GET discounts listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* GET discounts by category */
router.get('/:slug', function(req, res, next) {
  res.send(`Discounts in the ${req.params.slug} category`);
});

/* Get discounts by Id */
router.get('/view/:slug', function(req, res, next) {
  res.send(`Discount with id ${req.params.slug} displayed here`);
});
module.exports = router;
