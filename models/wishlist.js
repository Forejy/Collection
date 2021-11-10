const mongoose = require('mongoose')
const Schema = mongoose.Schema

const WishlistSchema = new Schema({
	name: { type: String, required: true },
	items: [{
		item_id: { type: Number }
	}],
	user_id: { type: String, required: true }
})

const Wishlist = mongoose.model('Wishlist', WishlistSchema)

module.exports = Wishlist;