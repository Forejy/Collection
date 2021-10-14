function Cart (oldCart) {
  this.items = oldCart.items
  this.totalQty = oldCart.totalQty

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

  this.remove = (id) => {
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

  this.generateArray = () => {
    let arr = []
    for (let id in this.items) {
      arr.push(this.items[id])
    }
    return arr
  }

  this.totalPrice = () => {
    const priceArr = Object.values(this.items).map(elem => elem.price)
    return priceArr.reduce((a, b) => a + b )
  }
}

exports.Cart = Cart