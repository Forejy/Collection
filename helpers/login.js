const isLoggedIn = (req, res, next) => {
  console.log('ISLOGGEDIN')
  if (req.isAuthenticated()) {
    return next() //# btw return next et next
  }
  req.session.oldUrl = req.originalUrl
  res.redirect('/user/login')
}

const isNotLoggedIn = (req, res, next) => {
	if (!req.isAuthenticated()) {
		return next()
	}
	res.redirect('/')
}

exports.isLoggedIn = isLoggedIn
exports.isNotLoggedIn = isNotLoggedIn