var express = require('express');
var router = express.Router();
const Item = require('../models/item')
const User = require('../models/user')
const { isLoggedIn, isNotLoggedIn } = require('../helpers/login')
const passport = require('passport');


/* GET Login & Signup (w/ Passport) */

router.get('/login', isNotLoggedIn, (req, res) => {
    const message = req.session.message //erreurs durant l'auth de passport
    req.session.message = null
    res.render('log-in', { message: message })
})

router.get('/logout', isLoggedIn, (req, res) => {
  req.logout()
  res.redirect('/')
})

router.get('/signup', isNotLoggedIn, (req, res) => {
    res.render('sign-up')
})


/* POST Login & Signup (w/ Passport) */

router.post('/login', isNotLoggedIn,
passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    console.log('LOGIN')
    console.log('oldUrl: ', req.session.oldUrl)
    if (req.session.oldUrl)
    {
			req.session.oldUrl = null
			res.redirect(req.session.oldUrl)
    } else {
			res.redirect('/');
		}
});

router.post('/signup', isNotLoggedIn, (req, res) => {
  console.log("bcrypt: ", bcrypt)
  bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
    if (err) done(err)
    new User({
      username: req.body.username,
      password: hashedPassword
    }).save(function(err) {
      if (err) done(err)
      res.redirect('/')
    })
  })
})


/* GET user shop. */

router.get('/:user_id', isLoggedIn, function(req, res, next) {
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
