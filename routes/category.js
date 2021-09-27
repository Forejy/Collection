const express = require('express');
const router = express.Router();
const Item = require('../models/item');

console.log("CATEGORY: ")
router.get("/:name", function(req, res, next) {
  Item.find({}, function(err, items) {
    console.log(items[0])
    res.render('category', { name: req.params.name, items: items })
  })
  console.log("CATEGORY: ", req.params.name)
  // res.render('category', { name: req.params.name })


})

// router.get('/', async function(req, res, next) {
//   await fetchText(function(err, data) {
//     res.json(data)
//   });

//   console.log("\nPAGE TEST\n");
// });


module.exports = router;