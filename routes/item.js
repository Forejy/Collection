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

const { isLoggedIn, isOwner } = require('../helpers/login')



//------ NEW item -----//
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

//------ CREATE a new item -----//
router.post("/new",
body(['name', 'edition']).custom(value => {
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

//------ NEW for one image -----//
router.get("/new/image", (req, res) => {
  res.render('new-image')
})

//------ CREATE Image -----//
router.post("/new/image", (req, res) => {
  console.log("req.session.item: ", req.session.item)
  console.log("req.file: ", req.file)

  // Handle any error
  upload.single('upload')(req, res, (err) => {
    console.log("uploadImage, err: ", err)
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

//------ INDEX all items -----//
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
  const item = await findItem(id, next)

  const flash = req.flash()
  res.render('item', { item: item, flash: flash })
})

//------ SHOW one image -----// //TODO: Pas le bon nom de route, je pense que ça devrait etre /:id/image/:name
router.get('/:id/image/:name', async (req, res, next) => {
  try {
    const gridFSBucket = res.locals.gridFSBucket
    const file = (await gridFSBucket.find({ filename: req.params.name }).limit(1).toArray())[0]

    if (!file) {
      console.log("//------ SHOW one image: file not found ------//")
      next(new Error("File not found"))
    }

    const readStream = await gridFSBucket.openDownloadStream(file._id)
    return readStream.pipe(res)
  } catch(err) {
      console.log("SHOW one image: error: ", err)
      next(err)
  }
})


//----- EDIT one item -----//
router.get('/:id/edit', isLoggedIn, isOwner, async (item, req, res, next) => {
  const imageName = item.image.replace(/\.[^/.]+$/, "")
  const flash = req.flash()
  res.render('item/edit', { item: item, flash: flash, image: imageName, ...fields })
})

//----- UPDATE one item -----//
router.put('/:id', isLoggedIn,
  body(['name', 'edition']).custom(value => {
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
isOwner,
async (item, req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req)
    const { id } = req.params
    if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/errors messages.
        // Error messages can be returned in an array using `errors.array()`.
        const errorsMsg = errors.array().map((elem) => { return elem.msg + " for: " + elem.param + " with value \'" + elem.value + "\'"})
        req.flash('error', errorsMsg)
        res.redirect('./' + id + '/edit')
    } else {
      // Data from form is valid.
      // Go to 2nd part of the form
        const newProps = req.body
        await Item.updateOne( { _id: id }, { ...newProps })
        req.flash('success', 'Your item has been well updated')
        res.redirect('./' + id + '/edit')
    }
  }
)

//------ DELETE one item ------//
router.delete("/:id", isLoggedIn, isOwner, async (item, req, res, next) => {
  const { id } = req.params
  await Item.deleteOne({ _id: id })
  req.flash('success', "Your item has been well deleted")
  res.redirect("/user/account")
})

//----- EDIT one image -----//
router.get('/:id/image/:name/edit', isLoggedIn, isOwner, async (item, req, res, next) => {
  const flash = req.flash()
  const imageName = item.image.replace(/\.[^/.]+$/, "")
  res.render('item/image/edit', { item: item, image: imageName, flash: flash })
})

//----- UPDATE one image (and DESTROY the previous one) -----//
router.put('/:id/image/:name', isLoggedIn, isOwner, async (item, req, res, next) => {

  upload.single('upload')(req, res, async (err) => {
    let { id, name } = req.params
    if (err instanceof multer.MulterError) {
      req.flash('error', err.message)
      res.redirect("/item/" + id + "/image/" + name + "/edit")
    } else if (err) {
      req.flash('error', err.message)
      res.redirect("/item/" + id + "/image/edit")
    } else {
      const gfstream = res.locals.gfstream

      gfstream.remove({ filename: item.image, root: 'images' }, async (err, gridStore) => {
        if (err) {
          req.flash('error', err.message)
          res.redirect("/item/" + id + "/image/" + name + "/edit")
        } else {
          req.flash('success', "The image has well been updated.")
          await Item.updateOne({ _id: id }, { image:  req.file.filename })
          res.redirect("/item/" + id + "/image/" + name + "/edit")
        }
      })
    }
  })
})


module.exports = router;