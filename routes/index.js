const express = require('express');
const router = express.Router();
const findTenItems = require('../controllers/ItemController').findTenItems

const fun = require('../seed')

/* GET home page. */
router.get('/', function(req, res, next) {
  fun()
  findTenItems(function(err, items) {
    if (err) done(err)
    // res.json(items)
    res.render('index', { title: 'Express', packages: items });
  })

});

module.exports = router;
