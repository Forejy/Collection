const express = require('express');
const router = express.Router();
const methodOverride = require('method-override')
const Cart = require('../models/cart').Cart
const Item = require('../models/item')

router.get('/show', (req, res) => {
  const cartItems = req.session.cart ? req.session.cart.items : null
  const successes = req.flash('success')
  res.render('cart', { cartItems: cartItems, successes: successes })
})

router.get('/add-to-cart/:id', (req, res) => {
  const itemId = req.params.id
  const cart = new Cart(req.session.cart ? req.session.cart : {})

  Item.findById(itemId, (err, item) => {
    if (err) {
      return res.redirect('/', { error: err }) //TODO: Utiliser flash
    }
    const errors = cart.add(item, item.id)
    if (errors === undefined) {
      console.log(item)
      console.log(cart)
      req.session.cart = cart;
      console.log(req.session.cart)

    }
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

router.delete('/', (req, res) => {
  delete req.session.cart
  req.flash('success', 'Cart cleared')
  res.redirect('/cart/show')
})


module.exports = router