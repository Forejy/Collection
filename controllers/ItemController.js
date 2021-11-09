const Item = require("../models/item")

const createItem = (obj, image, currentUser, done) => {
  //TODO: tester d'envoyer un objet à Item
  console.log("CREATE ITEM: ", obj)
  const item = new Item({ ...obj,  image: image, user_id: currentUser.id })
  console.log("item: ", item);

  item.save(function(err, item) {
    console.log(item)
    done(null, item._id)
  })
}

const findItem = async (id, next) => {
  try {
    const item = await Item.findOne({ _id: id })
    console.log("findItem, item: ", item)
    return item
  } catch(err) {
    return next(err)
  }
} //TODO demain : faire la route item/id puis afficher, et ensuite faire les liens

const findItemByBrand = (brand, done) => {
  console.log("BRAND: ", brand)
  Item.find({ brand: brand }, function(err, items) {
    if (err) done(err)
    done(null, items)
  })
}

const cacheNIMages = async (done) => {
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
}

const findTenItems = async (done) => {
  const arrObj = await Item.aggregate([
    { $group: {
      _id: "$brand",
      accu: { $push: { _id: "$_id", image: "$image", price: "$price" } }
      // accu: { $push: "$$ROOT"} //A Supprimer quand plus besoin
    }},
    {
      $addFields: {
        data: {
          $slice: [
            "$accu", 4
          ]
        }
      }
    },
    {
      $replaceWith: { brand: "$_id", item: "$data" }
    },
    { $sort: {
      brand: 1
    }}
  ])

  done(null, arrObj)
}

const findItems = async (id, done) => {
  try {
    console.log("findItems id: ", id)
    const items = await Item.find({ user_id: id })
    console.log("findItems items: ", items)
    return items
  } catch(err) {
    done(err)
  }
}

const updateItem = async (id, fieldsToUpdate, next) => {
  try {
    Item.updateOne({ _id: id }, { ...fieldsToUpdate })
  } catch(err) {
    next(err)
  }
}

exports.createItem = createItem
exports.findItem = findItem
exports.findItemsByBrand = findItemByBrand
exports.findTenItems = findTenItems
exports.findItems = findItems
