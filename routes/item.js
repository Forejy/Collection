const { createImmutableStateInvariantMiddleware } = require('@reduxjs/toolkit');
const express = require('express');
const router = express.Router();
const { findItem, createItem } = require('../controllers/itemController');
const { body, isAlphanumeric, validationResult } = require('express-validator')
const Item = require('../models/item')

const brands = ["Pokemon", "Magic", "Yugioh"]
const categories = ["Card"]
const conditions = ["Mint", "Near Mint", "Excellent", "Good", "Light Played", "Played", "Poor"]
const fields = { categories: categories, brands: brands, conditions: conditions }
const upload = require('../storage')
const multer = require('multer')

//------ FORM for a new item -----//
router.get('/new', function(req, res, next) {
  if (res.locals.currentUser !== undefined)
  {
    res.render('new-item', fields)
  } else {
    console.log(req.session.message)
    req.session.message = 'You must be connected to add a new item'
    res.redirect('/user/login')
  }
})

const StringEachBelongsTo = (str) => {
  const i = str.length
  while (i--) {
    if (!str.charAt(i).match(/[a-zA-Z0-9- #&]/))
    {
      console.log(false)
    } else {
      console.log (true)
    }
  }
}

//------ UPLOAD a new item -----//
router.post("/new",
body('name').isAlphanumeric('en-US'),
body('edition').custom(value => {
  var i = value.length
  while (i--) {
    if (!value.charAt(i).match(/[a-zA-Z0-9- #&]/))
    {
      throw new Error('Illegal Characters : only a-Z, 0-9. -#& and \' \'')
    } else {
      return true
    }
  }
}),
(req, res, next) => {
    console.log("MDW APRES POST : /NEW")
    // Extract the validation errors from a request.
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/errors messages.
        // Error messages can be returned in an array using `errors.array()`.
        console.log(errors.array())
        res.render("new-item", { errors: errors.array(), ...fields })
    } else {
      // Data from form is valid.
      // Go to 2nd part of the form
        req.session.item = req.body
        res.redirect("/item/new/image")
    }
  })

//------ FORM for one image -----//
router.get("/new/image", (req, res) => {
  res.render('new-image')
})

//------ UPLOAD Image -----//
router.post("/new/image", (req, res) => {
  console.log("req.session.item: ", req.session.item)
  console.log("req.file: ", req.file)

  // Handle any error
  upload.single('upload')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      res.render("new-image", { error: err })
    } else if (err) {
      res.render("new-image", { error: err })
    } else {
      res.redirect("/item//new/image")
    }
  })

  // Create Item w/ the filename of the image
  createItem(req.session.item, req.file.filename, res.locals.currentUser, (err, id) => {
    if (err) { res.render("new-image", { error: err }) }
    res.session.item = null;
    res.redirect('/item/' + id)
  })
})

//------ SHOW all items -----//
router.get('/all', (req, res) => {
  Item.find({}, (err, items) => {
    if (err) { console.log(err) }
    res.render('items', { name: "All Items", items: items })
  })
})

router.get('/all/resetdb', (req, res) => {
  // Item.find({}, )
  // const { fetchPokemonCards, fetchMagicCards, fetchYugiohCards } = require("../myApp")
  // Item.deleteMany({}, (err) => {
  //   if (err) { console.log(err) }
  // })
  // fetchPokemonCards()
  // fetchMagicCards()
  // fetchYugiohCards()
  // res.redirect('/')
})

//------ SHOW one item -----//
router.get("/:id", async (req, res, next) => {
  let { id } = req.params
  const findItem = require("../controllers/itemController").findItem
  const item = await findItem(id, next)

  res.render('item', { item: item })
})

//------ SHOW one image -----//
router.get('/image/:name', (req, res) => {
  const gfstream = res.locals.gfstream
  gfstream.files.findOne({ filename: req.params.name }, (err, file) => {
    if (err) { console.log("ERROR: ", err) }
    const readstream = gfstream.createReadStream({ _id: file._id })
    return readstream.pipe(res)
  })
})

//----- UPDATE one item -----//
router.get('/:id/update', async (req, res, next) => {
  let { id } = req.params
  const findItem = require('../controllers/itemController').findItem

  const item = await findItem(id, next)
  console.log("item UPDATE id: ", id)
  console.log("item UPDATE: ", await item)

  res.render('item/update', { item: item, ...fields })
})

router.post(':id/update', async (req, res, next) => {
  let { id } = req.params
  const item = await findOne(id, next)
  res.render('item/update', { item: item })
  //req.body qqch
  //Comparer l'item en db et l'item maintenant, resultat un objet
  //Envoyer l'objet resultat de la comparaison en db, en mettant à jour l'item dans la db
})


module.exports = router;