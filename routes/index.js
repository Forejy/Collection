const express = require('express');
const router = express.Router();
const findTenItems = require('../controllers/ItemController').findTenItems

/* GET home page. */
router.get('/', function(req, res, next) {
  const infos = req.flash('info')
  findTenItems(function(err, items) {
    if (err) done(err)
    res.render('index', { title: 'Express', packages: items, infos: infos });
  })
});



module.exports = router;
