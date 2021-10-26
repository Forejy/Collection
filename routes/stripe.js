const express = require('express');
const router = express.Router();
if (process.env.NODE_ENV === 'development') {
  require('dotenv').config();
}
const stripe = require('stripe')(
  'sk_test_51JmGhYGQO5hF0ENvCYAYMXYmNjuK1dBaKJrtDDV0R5NVlnB43AdQOiuZLBqBdGbrtDuC5plOQeJ51t3Ad8kxCF3p00hB3EE4JA');

const stripePublicKey = process.env.STRIPE_PUBLIC_KEY
const stripeSecretKey = process.env.STRIPE_SECRET_KEY

router.get('/', (req, res) => {
  console.log('stripe')
  res.render('stripe')
})

router.post('/create-checkout-session', async (req, res) => {
	console.log('/create-checkout-session')
	const session = await stripe.checkout.sessions.create({
		payment_method_types: ['card'],
		line_items: [
			{
				price_data: {
					currency: 'usd',
					product_data: {
						name: 'T-shirt',
					},
					unit_amount: 2000,
				},
				quantity: 1,
			},
		],
		mode: 'payment',
		success_url: 'http://localhost:3000/',
		cancel_url: 'http://localhost:3000/'
	})

	res.redirect(303, session.url)
})

module.exports = router