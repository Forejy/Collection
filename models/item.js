const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ItemSchema = new Schema ({
  name: { type: String, required: true },
  image: { type: String, required: true },
  brand: { type: String, required: true },
  category: { type: String, required: true },
  edition: { type: String, required: true },
  additional: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  condition: { type: String, required: true },
  user_id: { type: String, required: true }
})

// const ItemSchema = new Schema ({
//   name: String,
//   image: String,
//   brand: String,
//   category: String,
//   edition: String,
//   additional: String,
//   price: Number,
//   stock: Number,
//   condition: String,
//   user_id: String,
// })

const Item = mongoose.model('Item', ItemSchema)

module.exports = Item;