const isEmptyObject = require('../helpers/jsmethods')

function Cart (oldCart) {
  this.items = oldCart.items || {}
  this.totalQty = oldCart.totalQty || 0

  this.add = (item, id) => {
    let storedItem = this.items[id]
    if (!storedItem) {
      console.log(item)
      storedItem = { item: item, qty: 0, price: 0 }
      this.items[id] = storedItem
    }
    if (storedItem.qty < storedItem.item.stock) {
      storedItem.qty++
      storedItem.price = storedItem.item.price * storedItem.qty
      this.totalQty++
    } else {
      return ("This is the maximum we have in stock")
    }
  }

  this.removeOne = (id) => {
    const storedItem = this.items[id]
    if (storedItem) {
      if (storedItem.qty === 1) {
         delete this.items[id]
      } else {
        storedItem.qty -= 1
        storedItem.price = storedItem.item.price * storedItem.qty
        this.items[id] = storedItem
      }
      this.totalQty -= 1
    }
  }

  this.remove = (id) => {
    // Impossible qu'en front on call un remove sans qu'il y ait l'item présent dans le cart (mais peut-etre que je devrais quand meme protéger le back-end)
    delete this.items[id]
  }

  this.generateArray = () => {
    let arr = []
    for (let id in this.items) {
      arr.push(this.items[id])
    }
    return arr
  }

  this.totalPrice = () => {
    if (isEmptyObject(this.items)) {
      return 0
    } else {
      const priceArr = Object.values(this.items).map(elem => elem.price)
      return priceArr.reduce((a, b) => a + b )
    }
  }
}

exports.Cart = Cart