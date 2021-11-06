const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../helpers/login')

if (process.env.NODE_ENV === 'development') {
  require('dotenv').config();
}
const stripe = require('stripe')(
  'sk_test_51JmGhYGQO5hF0ENvCYAYMXYmNjuK1dBaKJrtDDV0R5NVlnB43AdQOiuZLBqBdGbrtDuC5plOQeJ51t3Ad8kxCF3p00hB3EE4JA');

//------ Checkout Route -----//
router.post('/create-checkout-session',  isLoggedIn, async (req, res) => {
	const cart = req.session.cart
	console.log(cart)
	if (cart.totalPrice < 1) {
		req.flash('warning', "Total price needs to be 1$ minimum")

		res.redirect('/cart/show')
	} else {
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
	}
})

//------ Successful Payment Route -----//
router.get('/successful-payment', isLoggedIn, async (req, res, next) => {
	//Find and Update 'stock' en soustrayant le stock de cet item dans le cart
	const Item = require('../models/item')
	const Cart = require('../models/cart')
	const createOrder = require('../controllers/orderController').createOrder

	const cart = new Cart(req.session.cart)
	let items = cart.generateArray();

	items = items.map((elem) => { //Preparing the purchased order
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
	const errors = await createOrder(user_id, items, cart.totalPrice, today)
	if (errors) { let errorsArr = [err] }

	items.forEach(item => {
		const newStock = item.item.stock - item.qty
		const id = item.item._id
		let errors2 = Item.findByIdAndUpdate(id, { stock: newStock })
		if (errors2) { errorsArr.push(errors2) }
	})

	delete req.session.cart
	res.render('stripe/successful-payment', { errors: errorsArr })
})

module.exports = router