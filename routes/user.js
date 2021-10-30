var express = require('express');
var router = express.Router();
const Item = require('../models/item')
const User = require('../models/user')
const { isLoggedIn, isNotLoggedIn } = require('../helpers/login')
const bcrypt = require("bcryptjs")
const passport = require('passport');
const { body, isAlphanumeric, validationResult } = require('express-validator')


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
    const flashErrors = req.flash('error')
    console.log(flashErrors)
    res.render('sign-up', { flashErrors: flashErrors })
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

router.post('/signup',
  isNotLoggedIn,
  body('username').custom(value => {
    var i = value.length
    while (i--) {
      if (!value.charAt(i).match(/[a-zA-Z0-9@*$#~_]/))
      {
        throw new Error('Illegal Characters : only a-Z, !@$*()_\- and ?')
      } else {
        return true
      }
    }
  }),
  body('username').custom(value => {
    const user = User.findOne({ username: value })
    user.then(user => {
    }).catch((err) => {
      throw new Error(err)
    })
    if (user) {
      throw new Error('Username already used, please choose an other')
    } else {
      return true
    }
  }),
  body('email').custom(value => {
    const user = User.findOne({ email: value })
    user.then(user => {
    }).catch((err) => {
      throw new Error(err)
    })
    if (user) {
      throw new Error('Email already used, please use an other')
    } else {
      return true
    }
  }),
  body('password').custom(value => {
    console.log("password: ", value)
    var i = value.length
    while (i--) {
      if (!value.charAt(i).match(/[a-zA-Z0-9!@$*()_\-?]/))
      {
        console.log("password: ", value)
        throw new Error('Illegal Characters : only a-Z, !@$*()_\- and ?')
      } else {
        return true
      }
    }
  }),

  (req, res) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/errors messages.
        // Error messages can be returned in an array using `errors.array()`.
        const errorsArr = errors.array().map((object) => {
          let param = object.param
          param = object.param.charAt(0).toUpperCase() + param.slice(1)
          return param + ": " + object.msg
        })
        req.flash('error', errorsArr)
        res.redirect("/user/signup")
    } else {
      console.log("bcrypt: ", bcrypt)
      // bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
      //   if (err) done(err)
      //   new User({
      //     username: req.body.username,
      //     password: hashedPassword,
      //     email: req.body.email
      //   }).save(function(err) {
      //     if (err) done(err)
      //     res.redirect('/')
      //   })
      // })
      res.redirect('/')
    }
  }
)

/* GET currentUser"own account */
router.get('/myaccount', isLoggedIn, (req, res, next) => {
  const Order = require('../models/order')
  const findOrdersByUser = require('../controllers/orderController').findOrdersByUser

  findOrdersByUser(res.locals.currentUser._id, (err, orders) => {
    if (err) {
      next(err)
    } else {
      res.render('user/myaccount', { orders: orders })
    }
  })


})

/* GET user shop. */

router.get('/:user_id', isLoggedIn, (req, res, next) => {
  const user_id = req.params.user_id

  User.findOne({ _id: user_id }, (err, user) => {
    if (err) { console.log(err) }

    Item.find({ user_id: user_id }, (err, items) => {
      if (err) { console.log(err) }
      res.render('user/user', { username: user.username, items: items })
    })
  })

});





module.exports = router;
