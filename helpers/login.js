const isLoggedIn = (req, res, next) => {
  console.log('ISLOGGEDIN')
  if (req.isAuthenticated()) {
    next()
  } else {
    req.session.oldUrl = req.originalUrl
    res.redirect('/user/login')
  }
}

const isNotLoggedIn = (req, res, next) => {
	if (!req.isAuthenticated()) {
		next()
	} else {
    res.redirect('/')
  }
}

const isVerified = async (req, res, next) => {
  const User = require('../models/user')

  const user = await User.find({ username: req.body.username })
  if (user) {
    if(!user.isVerified) {
      res.flash('error', "Your account has not been verified. Please check your email to verify your account")
      res.redirect('/login')
    }
  } else {
    next()
  }
}

const isOwner = async (req, res, next) => {
  const { id } = req.params
  const { findItem } = require("../controllers/ItemController")
  const item = await findItem(id, next)

  if (item.user_id == res.locals.currentUser._id) {
    next(item)
  } else {
    req.flash('warning', "You can't edit an item you don't own" )
    res.redirect('/')
  }
}

exports.isLoggedIn = isLoggedIn
exports.isNotLoggedIn = isNotLoggedIn
exports.isOwner = isOwner