var express = require('express');
var router = express.Router();
const Item = require('../models/item')
const User = require('../models/user')

/* GET user shop. */
router.get('/:user_id', function(req, res, next) {
  const user_id = req.params.user_id

  User.findOne({ _id: user_id }, (err, user) => {
    if (err) { console.log(err) }

    Item.find({ user_id: user_id }, (err, items) => {
      if (err) { console.log(err) }
      res.render('user', { username: user.username, items: items })
    })
  })

});

module.exports = router;
