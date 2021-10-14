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


const createManyItems = (done, objArray) => {
  console.log("objArray: ", objArray)
  Item.create(objArray, function(err, items) {
    if (err) return done(err)
    // done(null, items)
  })
}

const removeManyItems = (done, nameToRemove) => {
  Item.remove({ name: nameToRemove }, function(err, personFound) {
    Item.find({}, function(err, personFound) {
      if (err) return console.log(err);
      done(null, personFound);
    })
  })
};


const fetchPokemonCards = async (done) => { //TODO: View
  let objArray;
  try {
    const url = "https://api.pokemontcg.io/v2/cards?q=set.id:sm9&pageSize=10";
    const meta = {
      'X-Api-Key': process.env.pokemontcgAPI
    }
    const headers = new Headers(meta)
    const response = await fetch(url, {
      headers: headers
    });
    const data = (await response.json()).data;
    objArray = data.map(elem => new Item({
      name: elem.name,
      image: elem.images.large,
      brand: "Pokemon",
      category: "Card",
      edition: elem.set.series + " - " + elem.set.name,
      additional: "",
      price: elem.cardmarket.prices.averageSellPrice,
      stock: 7,
      condition: "New",
      user_id: "1"
    }))
  } catch (err) {
    done(err)
  }

  createManyItems(done, objArray)
}

const fetchMagicCards = async (done) => {
  console.log("FETCH: fetchMagicCards");
  const url = "https://api.magicthegathering.io/v1/cards?pageSize=10"
  let objArray;

  try {
    const response = await fetch(url);
    const json = (await response.json()).cards;

    objArray = json.map(elem => new Item({
      name: elem.name,
      image: elem.imageUrl,
      brand: "Magic",
      category: "Card",
      edition: elem.setName,
      additional: "",
      price: (Math.random() * 100).toFixed(2),
      stock: Math.floor(Math.random() * 20),
      condition: "New",
      user_id: "1"
    }))
  } catch (err) {
    done(err)
  }

  createManyItems(done, objArray)
  // Item.find({}, function (err, items) {
  //   if (err) return done(err)
  //   done(null, items)
  // })

}

const fetchYugiohCards = async (done) => {
  console.log("FETCH: fetchYugiohCards");
  const url = "https://db.ygoprodeck.com/api/v7/cardinfo.php?cardset=metal%20raiders"
  let objArray;

  try {
    const response = await fetch(url);
    const json = (await response.json()).data.slice(0, 10);


    objArray = json.map(elem => new Item({
      name: elem.name,
      image: elem.card_images[0].image_url,
      brand: "Yugioh",
      category: "Card",
      edition: "Metal Raiders",
      additional: "",
      price: (Math.random() * 100).toFixed(2),
      stock: Math.floor(Math.random() * 20),
      condition: "New",
      user_id: "1"
    }))
  } catch (err) {
    done(err)
  }


  // done(null, objArray)
  createManyItems(done, objArray)
  // Item.find({ }, function (err, items) {
  //   if (err) return done(err)
  //   done(null, items)
  // })

}


// TEST
{
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
}



exports.fetchPokemonCards = fetchPokemonCards;
exports.fetchMagicCards = fetchMagicCards;
exports.fetchYugiohCards = fetchYugiohCards;