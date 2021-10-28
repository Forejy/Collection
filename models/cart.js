const isEmptyObject = require('../helpers/jsmethods')

function Cart (oldCart) {
  this.items = oldCart.items || {}
  this.totalQty = oldCart.totalQty || 0
  this.totalPrice = oldCart.totalPrice || 0

  this.add = (item, id) => {
    let storedItem = this.items[id]
    if (!storedItem) {
      console.log(item)
      storedItem = { item: item, qty: 0, price: 0 }
      this.items[id] = storedItem
    }
    if (storedItem.qty < storedItem.item.stock) {
      storedItem.qty++
      storedItem.price += storedItem.item.price
      this.totalQty++
      console.log("storedItem.item.price: ", storedItem.item.price)
      console.log("totalPrice: ", this.totalPrice)
      this.totalPrice = parseFloat((this.totalPrice + storedItem.item.price).toFixed(2))
      console.log("totalPrice: ", this.totalPrice)
    } else {
      return ("This is the maximum we have in stock")
    }
  }

  this.removeOne = (id) => {
    const storedItem = this.items[id]
    if (storedItem) {
      this.totalPrice -= storedItem.item.price
      this.totalQty -= 1
      if (storedItem.qty === 1) {
         delete this.items[id]
      } else {
        storedItem.qty -= 1
        storedItem.price -= storedItem.item.price
        this.items[id] = storedItem
      }
    }
  }

  this.remove = (id) => {
    // Impossible qu'en front on call un remove sans qu'il y ait l'item présent dans le cart (mais peut-etre que je devrais quand meme protéger le back)
    this.totalPrice -= this.items[id].price
    delete this.items[id]
  }

  this.generateArray = () => {
    let arr = []
    for (let id in this.items) {
      arr.push(this.items[id])
    }
    return arr
  }
}

module.exports = Cart