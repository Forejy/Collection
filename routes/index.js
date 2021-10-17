const express = require('express');
const router = express.Router();
const findTenItems = require('../controllers/ItemController').findTenItems

/* GET home page. */
router.get('/', function(req, res, next) {
  findTenItems(function(err, items) {
    if (err) done(err)
    res.render('index', { title: 'Express', packages: items, messages: req.flash('info') });
  })
});



module.exports = router;
