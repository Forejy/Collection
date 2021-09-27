var express = require('express');
var router = express.Router();

const fetchText = require("../myApp").fetchText

/* GET home page. */
router.get('/', async function(req, res, next) {
  await fetchText(function(err, data) {
    res.json(data)
  });

  console.log("\nPAGE TEST\n");
});



module.exports = router;
