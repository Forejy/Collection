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
		success_url: 'http://localhost:3000/stripe/successful-payment',
		cancel_url: 'http://localhost:3000/'
	})

	res.redirect(303, session.url)
})

router.get('/successful-payment', isLoggedIn, (req, res, next) => {
	//Find and Update 'stock' en soustrayant le stock de cet item dans le cart
	const Item = require('../models/item')
	const Cart = require('../models/cart')
	const createOrder = require('../controllers/orderController').createOrder

	const cart = new Cart(req.session.cart)
	let items = cart.generateArray();
	items.forEach(item => {
		const newStock = item.item.stock - item.qty
		const id = item.item._id
		Item.findByIdAndUpdate(id, { stock: newStock }, (err, item) => {
			console.log(item)
			if (err) {
				next(err)
			}
		})
	})

	items = items.map((elem) => {
		item = elem.item
		return {
			item: {
				name: item.name,
				brand: item.brand,
				category: item.category,
				edition: item.edition,
				price: item.price,
				condition: item.condition
			},
			qty: elem.qty,
			price: elem.price
		}})
	const today = new Date(Date.now()).toDateString()
	const user_id = res.locals.currentUser._id
	createOrder(user_id, items, cart.totalPrice, today, next)

	delete req.session.cart
	res.render('stripe/successful-payment')
})

module.exports = router