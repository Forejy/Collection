var express = require('express');
var router = express.Router();

const fetch = require("../myApp").fetchYugiohCards

/* GET fetch page. */
router.get('', async function(req, res, next) {
  // console.log("\nPAGE FETCH\n");
  // await fetch(function(err, data) {
  //   if (err) done(err)
  //   // console.log(data)
  //   res.json(data)
  // });
});



module.exports = router;
