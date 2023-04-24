const Order = require("../models/order")

const createOrder = (user_id, items, totalPrice, dateOfPurchase) => {
	console.log(items)
	const order = new Order({ user_id: user_id, items: items, totalPrice: totalPrice, dateOfPurchase: dateOfPurchase })

	console.log(order)

	order.save((err, order) => {
		console.log(order)
		if (err) { return err }
	})
}

const findOrdersByUser = async (user_id, done) => {
	try {
		const orders = await Order.find({ user_id: user_id })
		return orders
	} catch(error) {
		done(error)
	}
}

exports.createOrder = createOrder
exports.findOrdersByUser = findOrdersByUser