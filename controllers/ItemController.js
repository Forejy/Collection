const Item = require("../models/item")

const findItem = (id, done) => {
  console.log("ID: ", id)
  Item.findOne({ _id: id }, function(err, item) {
    console.log(item)

    if (err) done(err)
    done(null, item)
  })
} //TODO demain : faire la route item/id puis afficher, et ensuite faire les liens

const findItemByBrand = (brand, done) => {
  console.log("BRAND: ", brand)
  Item.find({ brand: brand }, function(err, items) {
    if (err) done(err)
    done(null, items)
  })
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

  console.log(arrObj)
  done(null, arrObj)
}

exports.findItem = findItem
exports.findItemsByBrand = findItemByBrand
exports.findTenItems = findTenItems