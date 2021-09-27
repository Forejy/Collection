const mongoose = require('mongoose')

const Schema = mongoose.Schema

const ItemSchema = new Schema ({
  name: String,
  image: String,
  brand: String,
  category: String,
  edition: String,
  additional: String,
  price: Number,
  stock: Number,
  condition: String,
  user_id: String,
})

const Item = mongoose.model('Item', ItemSchema)

module.exports = Item;