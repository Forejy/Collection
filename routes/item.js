const express = require('express');
const router = express.Router();
const { findItem } = require('../controllers/ItemController');

console.log("ITEM: ")
router.get("/:id", function(req, res, next) {
  let { id } = req.params

  findItem(id, function(err, item) {
    if (err) done(err)
    console.log(item)
    res.render('item', { item: item })
  })
})

module.exports = router;