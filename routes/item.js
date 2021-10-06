const { createImmutableStateInvariantMiddleware } = require('@reduxjs/toolkit');
const express = require('express');
const router = express.Router();
const { findItem, createItem } = require('../controllers/ItemController');
const { body, isAlphanumeric, validationResult } = require('express-validator')

const brands = ["Pokemon", "Magic", "Yugioh"]
const categories = ["Cards"]
const conditions = ["Mint", "Near Mint", "Excellent", "Good", "Light Played", "Played", "Poor"]
const fields = { categories: categories, brands: brands, conditions: conditions }

router.get('/new', function(req, res, next) {
  if (res.locals.currentUser !== undefined)
  {
    res.render('new-item', fields)
  } else {
    console.log(req.session.message)
    req.session.message = 'You must be connected to add a new item'
    res.redirect('/login')
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
      // function(req, res, next) {
        console.log("req.body: ", req.body)
        createItem(req.body, res.locals.currentUser, function(err, item) {
          console.log(item)
        })
        res.redirect("/")
        // Data from form is valid.
    }
  })

// router.post("/new",
// function(req, res, next) {
//   console.log(req.body)
//   createItem("test", function(err, item) {
//     console.log(item)
//   })
//   res.redirect("/")
// })

router.get("/:id", function(req, res, next) {
  let { id } = req.params

  findItem(id, function(err, item) {
    //TODO: ça plante ici pour une unhandled error
    if (err) done(err)
    console.log(item)
    res.render('item', { item: item })
  })
})



module.exports = router;