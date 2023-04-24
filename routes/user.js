var express = require('express');
var router = express.Router();
const Item = require('../models/item')
const User = require('../models/user')
const { isLoggedIn, isNotLoggedIn } = require('../helpers/login')
const bcrypt = require("bcryptjs")
const passport = require('passport');
const { body, isAlphanumeric, validationResult } = require('express-validator')
const sgMail = require('@sendgrid/mail')



/* GET Login & Signup (w/ Passport) */

router.get('/login', isNotLoggedIn, (req, res) => {
    const message = req.session.message //erreurs durant l'auth de passport //TODO: à quel moment j'assigne le message, pcq je dois pouvoir utiliser req.flash maintenant
    req.session.message = null
    const flash = req.flash()
    res.render('log-in', { message: message, flash: flash })
})

router.get('/logout', isLoggedIn, (req, res) => {
  req.logout()
  res.redirect('/')
})

router.get('/signup', isNotLoggedIn, (req, res) => {
    const flash = req.flash()
    res.render('sign-up', { flash: flash })
})


/* POST Login & Signup (w/ Passport) */

router.post('/login', isNotLoggedIn, passport.authenticate('local', { failureRedirect: '/user/login', failureFlash: true }),
  (req, res) => {
    if (req.flash())
    console.log('LOGIN')
    console.log('oldUrl: ', req.session.oldUrl)
    if (req.session.oldUrl)
    {
      const redirect = req.session.oldUrl
			req.session.oldUrl = null
			res.redirect(redirect)
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
  body('username').custom(async value => {
    const user = await User.findOne({ username: value })
    if (user) {
      throw new Error('Username already used, please choose an other')
    } else {
      return true
    }
  }),
  body('email').custom(async value => {
    const user = await User.findOne({ email: value })
    if (user) {
      throw new Error('This email address has already been used')
    } else {
      return true
    }
  }),
  body('password').custom(value => {
    var i = value.length
    while (i--) {
      if (!value.charAt(i).match(/[a-zA-Z0-9!@$*()_\-?]/))
      {
        throw new Error('Illegal Characters : only a-Z, !@$*()_\- and ?')
      } else {
        return true
      }
    }
  }),
  async (req, res) => {
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
      bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
        if (err) done(err)
        const crypto = require("crypto")
        new User({
          username: req.body.username,
          password: hashedPassword,
          email: req.body.email,
          emailToken: crypto.randomBytes(64).toString('hex'),
          isVerified: false
        }).save(async (err, user) => {
          if (err) {
            req.flash('error', err.message)
            return res.redirect("/user/signup")//TODO: FORMULAIRE DE CONTACT
          }
          // res.redirect('/')
          const verificationLink = "http://" + req.headers.host + "/user/verify-email?token=" + user.emailToken
          const msg = {
            from: 'Forejy@protonmail.com',
            to: user.email,
            subject: 'Collection - verify your email',
            text: 'Hello, thanks for registering on our site.\nPlease copy and paste the link below to verify your account.\n' + verificationLink,
            html: "<h1>Hello, </h1>" +
            "<p>Thanks for registering on our site.</p>" +
            "<p>Please click the link below to verify your account.</p>" +
            "<a href=\"" + verificationLink + "\">Verify your account</a>"
          }
          try {
            sgMail.setApiKey(process.env.SENDGRID_API_KEY)
            await sgMail.send(msg)
            req.flash('success', 'Thanks for registering. Please check your email to verify your account')
            res.redirect('/user/login')
          } catch(error) {
            console.log(error)
            req.flash('error', 'Something went wrong.  Please contact us for assistance')
            res.redirect('/user/signup')//TODO: FORMULAIRE DE CONTACT
          }
        })
      })
    }
  }
)

router.get('/verify-email', async (req, res, next) => {
  try {
    const user = await User.findOne({ emailToken: req.query.token })
    if (!user) {
      req.flash('error', 'Token is invalid. Please contact us for assistance')
      return res.redirect('/user/signup')
    } else {
      user.emailToken = null
      user.isVerified = true;
      await user.save()
      req.flash('success', 'You account has been activated.')
      res.redirect('/user/login')
      // passport.authenticate('local', { failureRedirect: '/login' })
    }
    //Trouver l'utilisateur
    //Changer la valeur de isVerified
  } catch(error) {
    console.log(error)
    req.flash('error', 'Something went wrong. Please contact us for assistance')
    res.redirect('/user/signup')//TODO: FORMULAIRE DE CONTACT
  }
})


/* GET currentUser own account */
router.get('/account', isLoggedIn, async (req, res, next) => {
  const findItems = require('../controllers/itemController').findItems
  const userId = res.locals.currentUser._id

  const userItems = await findItems(userId, next)
  const flash = req.flash()
  res.render('user/account', { items: userItems, flash: flash })
})

router.get('/account/previous-orders', isLoggedIn, async (req, res, next) => {
  const findOrdersByUser = require('../controllers/orderController').findOrdersByUser
  const userId = res.locals.currentUser._id

  const userOrders = await findOrdersByUser(userId, next)
  res.render('user/previous-orders', { orders: userOrders })
})

/* GET user shop. */

router.get('/:user_id', isLoggedIn, (req, res, next) => {
  const user_id = req.params.user_id

  User.findOne({ _id: user_id }, (err, user) => {
    console.log()
    if (err) { console.log(err) }

    Item.find({ user_id: user_id }, (err, items) => {
      if (err) { console.log(err) }
      res.render('user/user', { username: user.username, items: items })
    })
  })

});





module.exports = router;
