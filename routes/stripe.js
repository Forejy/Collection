const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../helpers/login')

if (process.env.NODE_ENV === 'development') {
  require('dotenv').config();
}
const stripe = require('stripe')(
  'sk_test_51JmGhYGQO5hF0ENvCYAYMXYmNjuK1dBaKJrtDDV0R5NVlnB43AdQOiuZLBqBdGbrtDuC5plOQeJ51t3Ad8kxCF3p00hB3EE4JA');

const stripePublicKey = process.env.STRIPE_PUBLIC_KEY
const stripeSecretKey = process.env.STRIPE_SECRET_KEY

router.post('/create-checkout-session',  isLoggedIn, async (req, res) => {
	const cartTotalPrice = req.session.cart.totalPrice * 100
	const session = await stripe.checkout.sessions.create({
		payment_method_types: ['card'],
		line_items: [
			{
				price_data: {
					currency: 'usd',
					product_data: {
            name: 'T-shirt',
          },
					unit_amount: cartTotalPrice,
				},
				quantity: 1,
			},
		],
		mode: 'payment',
		success_url: 'http://localhost:3000/',
		cancel_url: 'http://localhost:3000/'
	})

	console.log(session.url)
	res.redirect(303, session.url)

})

router.get('/successful-payment', isLoggedIn, (req, res) => {

	res.render('stripe/successful-payment')
})

module.exports = router