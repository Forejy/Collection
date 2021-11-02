var express = require('express');
var router = express.Router();


router.get('/', async (req, res) => {
	require('dotenv').config();

	const sgMail = require('@sendgrid/mail')
	console.log("ENV: ", process.env.SENDGRID_API_KEY)
	sgMail.setApiKey(process.env.SENDGRID_API_KEY)
	const msg = {
		to: 'joffrey.marques@gmail.com', // Change to your recipient
		from: 'Forejy@protonmail.com', // Change to your verified sender
		subject: 'Sending with SendGrid is Fun',
		text: 'and easy to do anywhere, even with Node.js',
		html: '<strong>and easy to do anywhere, even with Node.js</strong>',
	}
	try {
		await sgMail.send(msg)
		console.log('Email sent')
	} catch(error) {
		console.error(error)
		req.flash('error', 'Something went wrong. Please contact us for assistance.')
	}
})

module.exports = router;
