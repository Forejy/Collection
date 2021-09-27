const { Headers } = require("node-fetch");
const fetch = require("node-fetch");
const env = require('dotenv').config();
const mongoose = require('mongoose');
const { Schema, Model } = mongoose;
const Item = require("./models/item")

mongoose.connect(process.env.MONGO_URI);

// fetch TEST
{
// const fetchText = async (done) => {
//   Item.deleteMany({}, async function() {
//       const url = "https://api.pokemontcg.io/v2/cards?q=set.id:sm9&pageSize=10";
//       let response = await fetch(url);
//       let data = (await response.json()).data;
//       done(null, data);
//   })
// }
}


const fetchText = async (done) => { //TODO: View
  Item.deleteMany({}, async function() {
    let objArray;
    try {
      console.log("2")
      const url = "https://api.pokemontcg.io/v2/cards?q=set.id:sm9&pageSize=10";
      const meta = {
        'X-Api-Key': process.env.pokemontcgAPI
      }
      const headers = new Headers(meta)
      console.log("3 headers: ", headers)
      const response = await fetch(url, {
        headers: headers
      });
      console.log("4")
      console.log("response: ", response)
      const data = (await response.json()).data;
      console.log("DATA: ", data)
      objArray = data.map(elem => new Item({
        name: elem.name,
        image: elem.images.large,
        brand: "?",
        category: "?",
        edition: elem.set.series + " - " + elem.set.name,
        additional: "",
        price: elem.cardmarket.prices.averageSellPrice,
        stock: 7,
        condition: "New",
        user_id: "1"
      }))
      console.log("OBJECT ARRAY: ", objArray);
    } catch (err) {
      console.log("error: ", err)
      done(err)
    }

    Item.create(objArray, function(err, items) {
      if (err) return done(err)
      done(null, items)
    })
  })
}


// const Item = mongoose.model(
//   'Item',
//   new Schema({
//     name: String,
//     image: String,
//     brand: String,
//     category: String,
//     edition: String,
//     additional: String,
//     price: Number,
//     stock: Number,
//     condition: String,
//     user_id: String,
//   })
// )

const User = mongoose.model(
  'User',
  new Schema({
    name: String,
    items: Array
  })
)


const user = new User ({
  name: "vendeur64",
  items: []
})

const item = new Item ({
  name: "PikachuEX",
  brand: "Pokemon",
  category: "Card",
  edition: "XY124",
  additional: "Promo",
  price: 2,
  stock: 12,
  Condtion: "Comme Neuve",
  user_id: user.id
})


const test = (done) => {
  Item.deleteMany({}, function(err, result) {
    if (err) return next(err)
    console.log(result)

    User.deleteMany({}, function(err, result) {
      if (err) return next(err)
      console.log(result)

      user.save(function (err, user) {
        if (err) return done(err)
        console.log("user w/out items saved: ", user);

        item.save(function(err, item) {
          if (err) return done(err)
          console.log("item saved: ", item);

          console.log(user);
          user.items = [ item._id ];
          console.log(user);
          user.save(function(err, user) {
            User.find({}, function(err, users) {
              if (err) return done(err)
              console.log("users: ", users)
              done(null, users)
            })
          });

        })

      })
    });

  });
}



exports.ItemModel = Item;
exports.UserModel = User;
exports.test = test;
exports.fetchText = fetchText;