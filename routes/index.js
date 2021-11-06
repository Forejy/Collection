const express = require('express');
const router = express.Router();
const findTenItems = require('../controllers/itemController').findTenItems

/* GET home page. */
router.get('/', function(req, res, next) {
  const flash = req.flash()
  console.log("currentUser: ", res.locals.currentUser)
  findTenItems(function(err, items) {
    if (err) done(err)
    res.render('index', { title: 'Express', packages: items, flash: flash });
  })
});



module.exports = router;
