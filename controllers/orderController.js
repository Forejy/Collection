const Order = require("../models/order")

const createOrder = (user_id, items, totalPrice, dateOfPurchase, next) => {
	console.log(items)
	const order = new Order({ user_id: user_id, content: items, totalPrice: totalPrice, dateOfPurchase: dateOfPurchase })

	console.log(order)

	order.save((err, order) => {
		console.log(order)
		// if (err) {
			// next(err)
		// } else {
			// next(null)
		// }
	})
}

const findOrdersByUser = (user_id) => {
	Order.find({ user_id: user_id }, (err, orders) => {
    if (err) {
			 next(err)
		} else {
			console.log(orders)
			done(null, orders)
		}
  })
}

exports.createOrder = createOrder
exports.findOrdersByUser = findOrdersByUser