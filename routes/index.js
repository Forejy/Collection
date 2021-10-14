const express = require('express');
const router = express.Router();
const findTenItems = require('../controllers/ItemController').findTenItems

/* GET home page. */
router.get('/', function(req, res, next) {
  findTenItems(function(err, items) {
    if (err) done(err)
    res.render('index', { title: 'Express', packages: items, messages: req.flash('info') });
  })
});


const Cart = require('../models/cart').Cart
const Item = require('../models/item')

router.get('/add-to-cart/:id', (req, res) => {
  const itemId = req.params.id
  const cart = new Cart(req.session.cart ? req.session.cart : { items: {} })

  Item.findById(itemId, (err, item) => {
    if (err) {
      return res.redirect('/', { error: err })
    }
    const message = cart.add(item, item.id)
    if (message === undefined) { req.session.cart = cart; }
    req.flash('info', message)
    console.log(req.session.cart)
    res.redirect('/')
  })
})

router.get('/remove-from-cart/:id', (req, res) => {
  if (req.session.cart) {
    const itemId = req.params.id
    const cart = new Cart(req.session.cart)
    cart.remove(itemId)
    req.session.cart = cart
  }
  res.redirect('/')
})

module.exports = router;
