const express = require('express');
const router = express.Router();
const { findItemsByBrand } = require('../controllers/itemController')

router.get("/:name", function(req, res, next) {
  let brand = req.params.name
  brand = brand.charAt(0).toUpperCase() + brand.slice(1)

  findItemsByBrand(brand, function(err, items) {
    if (err) done(err)
    res.render('items', { name: brand, items: items })
  })
})


module.exports = router;