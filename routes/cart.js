const express = require('express');
const router = express.Router();
const methodOverride = require('method-override')
const Cart = require('../models/cart')
const Item = require('../models/item')

router.get('/show', (req, res, next) => {
  //TODO: test avec un cart supprimé de la db
  let cart
  let cartItems
  let totalPrice
  if (req.session.cart) {
    cart = req.session.cart
    cartItems = cart.items
    totalPrice = cart.totalPrice
  } else {
    cartItems = null
    totalPrice = null
  }

  const flash = req.flash()

  res.render('cart', { cartItems: cartItems, flash: flash, totalPrice: totalPrice })
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

router.delete('/empty-card', (req, res) => {
  delete req.session.cart
  req.flash('success', 'Cart cleared')
  res.redirect('/cart/show')
})


module.exports = router