const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema ({
  username: { type: String, required: true },
  email: { type: String, required: true },
  emailToken: { type: String },
  isVerified: { type: Boolean, required: true },
  password: { type: String, required: true },
  items: { type: Array, required: true }
})

const User = mongoose.model('User', UserSchema)

module.exports = User;