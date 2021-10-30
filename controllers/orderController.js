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

const findOrdersByUser = (user_id, done) => {
	Order.find({ user_id: user_id }, (err, orders) => {
    if (err) {
			 done(err)
		} else {
			console.log("orders: ", orders)
			done(null, orders)
		}
  })
}

exports.createOrder = createOrder
exports.findOrdersByUser = findOrdersByUser