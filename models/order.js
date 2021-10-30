const mongoose = require('mongoose')
const Schema = mongoose.Schema

const OrderSchema = new Schema ({
	user_id: { type: String, required: true },
	items: [{
		item: {
			name: { type: String, required: true },
			brand: { type: String, required: true },
			category: { type: String, required: true },
			edition: { type: String, required: true },
			price: { type: Number, required: true },
			condition: { type: String, required: true }
		},
		qty: { type: Number, required: true },
		price: { type: Number, required: true }
	}],
	totalPrice: { type: Number, required: true },
	dateOfPurchase: { type: String, required: true }
})

const Order = mongoose.model('Order', OrderSchema)

module.exports = Order