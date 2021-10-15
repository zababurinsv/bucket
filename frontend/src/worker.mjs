import api from './fs/api.mjs'
import FS from './fs/main.mjs'
import wasm from './fs/wasmBinary.mjs'
import ApiBack from './api.mjs'
import isEmpty from "./isEmpty.mjs";
import calc from './calc.mjs'
let files = null;
let isSend = true
let course = {
  current: 80,
  change: 0
}

let store = {
  products: undefined,
  cart: {}
}


let cart = {
  add: async (item) => {
    let product = (store.products[`${item.idGroup}`].filter(product => product.id === item.idProduct))[0]
    product.available = product.available - 1
    isEmpty(store.cart[`${item.idGroup}`])
        ? (
            store.cart[`${item.idGroup}`] = {},
            isEmpty(store.cart[`${item.idGroup}`][`${item.idProduct}`])
                ? store.cart[`${item.idGroup}`][`${item.idProduct}`] = []
                : '',
            store.cart[`${item.idGroup}`][`${item.idProduct}`].push(item)
          )
        : (
            isEmpty(store.cart[`${item.idGroup}`][`${item.idProduct}`])
                ? store.cart[`${item.idGroup}`][`${item.idProduct}`] = []
                : '',
            store.cart[`${item.idGroup}`][`${item.idProduct}`].push(item)
          )
    return true
  },
  remove: async (item) => {
    let product = (store.products[`${item.idGroup}`].filter(product => product.id === item.idProduct))[0]
    product.available = product.available + 1
    store.cart[`${item.idGroup}`][`${item.idProduct}`].pop()
    if(store.cart[`${item.idGroup}`][`${item.idProduct}`].length === 0) {
      delete store.cart[`${item.idGroup}`][`${item.idProduct}`]
    }
    return true
  },
  update: async (product) => {
    if(!isEmpty(store.cart)) {
      if(!isEmpty(store.cart[`${product.idGroup}`])) {
         if(!isEmpty(store.cart[`${product.idGroup}`][`${product.idProduct}`])) {
           console.log('update cart', product, store)
           let products = store.cart[`${product.idGroup}`][`${product.idProduct}`]
           for(let key in products) {
             products[key].price = product.price
             products[key].priceUsd = product.priceUsd
             products[key].name = product.name
           }
         }
      }
    }
    return true
  }
}


let product = {
  update: async (item) => {
    let product = (store.products[`${item.idGroup}`].filter(product => product.id === item.idProduct))[0]
    product.name = item.name
    product.available = item.available
    product.price.usd = calc.convert.rub(item.price)
    product.price.rub = calc.convert.usd(product.price.usd)
    item.price = product.price.rub
    item.priceUsd = product.price.usd
    await cart.update(item)
    return true
  }
}
/**
 * factorial
 */
function heavyComputation (num) {
  for(let i = num - 1; i > 0; i--){
    num *= i;
  }
  return num;
}

let workerFS = FS({ wasmBinary: wasm })
workerFS.then(async (Module)=> {
  let FS = Module.FS
  FS.mkdir('/data');
  FS.api = await api(FS)
  FS.mount(Module.FS.filesystems.WORKERFS, {
    files: files,
    blobs: []
  }, '/data');
})

self.onmessage = async (events) => {
  switch (events.data.type) {
    case 'update-product':
      isSend = false
      await product.update(events.data.product)
      self.postMessage({
        type: 'add-cart',
        tick: count,
        isSend: true,
        data: store.products,
        cart: store.cart,
        course: course
      });
      isSend = true
      break
    case 'update':
      isSend = events.data.isSend
      break
    case 'change-course':
      isSend = false
      course = await ApiBack.set.course(events.data.course)
      isSend = true
      break
    case 'reset-change':
      isSend = false
      await ApiBack.reset.courseChange()
      isSend = true
      break
    case 'add-cart':
      isSend = false
      await cart.add(events.data.product)
      self.postMessage({
        type: 'add-cart',
        tick: count,
        isSend: true,
        data: store.products,
        cart: store.cart,
        course: course
      });
      isSend = true
      break
    case 'remove-from-cart':
      isSend = false
      await cart.remove(events.data.product)
      self.postMessage({
        type: 'add-cart',
        tick: count,
        isSend: true,
        data: store.products,
        cart: store.cart,
        course: course
      });
      isSend = true
      break
    default:
      console.warn('неопределён тип события', events.data)
      break
  }
}

let count = 0
let timerId = setTimeout(async function tick() {
  if(isSend) {
    store.products = (isEmpty(store.products))
      ? await ApiBack.get.products()
      : await ApiBack.get.store(store.products)
    store.cart = await ApiBack.get.cart(store.cart)
    self.postMessage({
      type: 'products',
      tick: count,
      isSend: isSend,
      data: store.products,
      cart: store.cart,
      course: course
    });
  }
  count = (count === 100) ? 0 : count + 1
  timerId = setTimeout(tick, 15000);
}, 0);