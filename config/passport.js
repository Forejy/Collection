const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs")

const User = require('../models/user')


module.exports = (passport) => {
	passport.use(
		new LocalStrategy( async (username, password, done) => {
			try {
				//-------- User Matching ------//
				const user = await User.findOne({ username: username });
				console.log("user: ", user)
				if (!user) {
					console.log("user: ", user)
						return done(null, false, { message: 'Incorrect username.' });
					}
				if(!user.isVerified) {
					return done(null, false, { message: "Your account has not been verified. Please check your email to verify your account" })
				}

				//----- Password Matching -----//
				bcrypt.compare(password, user.password, (err, res) => {
					if (res) {
						return done(null, user)
					} else {
						return done(null, false, { message: 'Incorrect password.' });
					}
				})
			} catch(error) {
				return done(error);
			}
		})
	);

	passport.serializeUser((user, done) => {
		console.log("serializeUser")
		done(null, user.id);
	});

	passport.deserializeUser((id, done) => {
		console.log("deserializeUser 1")
		User.findById(id, (err, user) => {
			if(err) { done(err)}
			console.log("deserializeUser 2")
			done(null, user);
		});
	});
}

