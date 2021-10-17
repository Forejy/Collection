const express = require('express');
const router = express.Router();
const Cart = require('../models/cart').Cart
const Item = require('../models/item')

router.get('/show', (req, res) => {
  console.log(req.session.cart)
  const cartItems = req.session.cart.items
  res.render('cart', { cartItems: cartItems })
})

router.get('/add-to-cart/:id', (req, res) => {
  const itemId = req.params.id
  const cart = new Cart(req.session.cart ? req.session.cart : {})

  Item.findById(itemId, (err, item) => {
    if (err) {
      return res.redirect('/', { error: err })
    }
    const errors = cart.add(item, item.id)
    if (errors === undefined) { req.session.cart = cart; }
    req.flash('info', errors)
    res.redirect('/')
  })
})

router.get('/remove-one-from-cart/:id', (req, res) => {
  if (req.session.cart) {
    const itemId = req.params.id
    const cart = new Cart(req.session.cart)
    cart.removeOne(itemId)
    req.session.cart = cart
  }
  res.redirect('/')
})


module.exports = router