const express = require('express');
const router = express.Router();

console.log("CATEGORY: ")
router.get("/:name", function(req, res, next) {
  console.log("CATEGORY: ", req.params.name)
  res.render('category', { name: req.params.name })

})

// router.get('/', async function(req, res, next) {
//   await fetchText(function(err, data) {
//     res.json(data)
//   });

//   console.log("\nPAGE TEST\n");
// });


module.exports = router;