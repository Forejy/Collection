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

exports.isLoggedIn = isLoggedIn
exports.isNotLoggedIn = isNotLoggedIn