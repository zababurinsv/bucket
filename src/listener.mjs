import { events } from 'z-events'
import template from './template.mjs'
import isEmpty from "./isEmpty.mjs";
let self = {}
let timerId = null;

let parentNode = async (event, type) => {
   try {
       let parent = {}
       let isParent = true
       if(event.target.classList.contains(type)) {
           parent = event.target
       } else {
           isParent = false
           parent =  event.target.parentNode
           while (!parent.classList.contains(type)) {
               parent = parent.parentNode;
           }
       }
       return {
           parent: parent,
           isParent: isParent
       }
   } catch (e) {
       console.error(e)
       return  true
   }
}

let removeProductCart = async (events) => {
    events.preventDefault()
    let item = (await parentNode(events,'-cart__container_item')).parent
    let id = parseFloat((item.querySelector('.-cart__container_item_productId').textContent))
    let name = item.querySelector('.-cart__container_item_name').textContent
    let available = parseFloat((item.querySelector('.-cart__container_item_quantity').textContent))
    let price = parseFloat((item.querySelector('.-cart__container_item_price').textContent))
    let idGroup = (item.querySelector('.-cart__container_item_groupId').textContent).trim()
    if(available === 0) {
        alert("К сожалению товар закончился");
    } else {
        self.worker.postMessage({
            type: 'remove-from-cart',
            product: {
                idGroup: idGroup,
                idProduct: id,
                name: name,
                price: price,
                available: available
            }
        })
    }
}

let closeModal = (event) => {
    event.preventDefault()
    self.modal.window.close()
    self.modal.background.style.display = "none"
    self.worker.postMessage({isSend: true, type: "update"})
}

let saveModal = (event) => {
    event.preventDefault()
    self.modal.window.close()
    self.modal.background.style.display = "none"
    events.send('/save_modal', { }, (object) => {
        self.worker.postMessage({isSend: true, type: "update-product", product: object})
    })
}

let showModal = (event) => {
    self.modal.background.style.display = "block"
    self.modal.window.show()

}

let addToCart = (event) => {
    event.preventDefault()
    self.worker.postMessage({isSend: false, type: "update"})
    if (!timerId) {
        timerId = setTimeout(async () => {
            timerId = clearTimeout(timerId)
            let item = await parentNode(event,'-products__container-item__details_item')
            let group = await parentNode(event,'-products__container-item')
            let id = parseFloat((item.parent.querySelector('.-products__container-item__details_item_id').textContent))
            let name = item.parent.querySelector('.-products__container-item__details_item_name').textContent
            let available = parseFloat((item.parent.querySelector('.-products__container-item__details_item_available').textContent))
            let price = parseFloat((item.parent.querySelector('.-products__container-item__details_item_price').textContent))
            let priceUsd = parseFloat((item.parent.querySelector('.-products__container-item__details_item_price-usd').textContent))
            let idGroup = group.parent.querySelector('summary').textContent.trim()
            if(available === 0) {
                alert("К сожалению товар закончился");
            } else {
                self.worker.postMessage({
                    type: 'add-cart',
                    product: {
                        idGroup: idGroup,
                        idProduct: id,
                        name: name,
                        price: price,
                        priceUsd: priceUsd,
                        available: available
                    }
                })
            }
        }, 400);
    } else {
        timerId = clearTimeout(timerId)
    }
}

let doubleClickListener = async (event) => {
    self.worker.postMessage({isSend: false, type: "update"})
    self.modal.window.close()
    let parent = await parentNode(event,'-products__container-item__details_item')
    if(!parent.isParent) {
        self.get.template.modal({
            target: event.target,
            parentNode: parent
        })
        showModal()
    }
}

let changeCourse = (event) => {
    event.preventDefault()
    if(self.course.usd.value < 20 || self.course.usd.value > 80) {
        alert("Курс должен быть не наже 20 и не выше 80 рублей");
    } else {
        self.course.status.textContent = 'Курс обновится в течении 15 секунд'
        self.worker.postMessage({
            type:"change-course",
            course: self.course.usd.value,
            isSend: false
        })
    }
}

let worker = (docs = { }) => {
    return new Promise(async (resolve, reject) => {
        self = docs
        // let manager = await import("https://zababurinsv.github.io/z-events/index.min.mjs");
        docs.worker.onmessage = msg => {
            if(msg.data.isSend) {
                self.course.current.textContent = ''
                self.course.current.textContent = `текущий курс: ${msg.data.course.current}`
                if(parseFloat(msg.data.course.change) !== 0) {
                    self.course.status.textContent = 'Если курс не изменится за 15 секунд цвет станет белым'
                } else {
                    self.course.status.textContent = ''
                }
                template("products", docs, {
                 data: msg.data.data,
                 change: parseFloat(msg.data.course.change)
                });

                if(!isEmpty(msg.data.cart)) {
                    template("cart", docs, {
                        cart: msg.data.cart,
                        change: parseFloat(msg.data.course)
                    });
                }
            }
        }
        docs.worker.onerror = function(event) {
            console.log('There is an error with your worker!', event);
        }
        resolve(true)
    })
}

let modal = (docs) => {
    self = docs
    docs.modal.close.addEventListener('click', closeModal)
    docs.modal.save.addEventListener('click', saveModal)
    docs.modal.background.addEventListener('click', closeModal)
}

let product = (docs) => {
    let item = docs.querySelector('.-products__container-item__details_item')
    item.addEventListener('click', addToCart)
    item.addEventListener('dblclick', doubleClickListener );
}

let terminate = (items) => {
    for(let item of items) {
      item.removeEventListener('click', addToCart);
      item.removeEventListener('dblclick', doubleClickListener );
    }
}

let course = (docs) => {
    self = docs
    docs.panel.course.addEventListener('click', changeCourse)
}

let removeProduct = (item) => {
    item.addEventListener('click', removeProductCart)
}

export default {
    worker: worker,
    product: {
        add: product,
        terminate: terminate
    },
    panel: {
        course: course
    },
    modal: {
        main: modal
    },
    cart: {
      remove: removeProduct
    },
    utils: {
        parent: parentNode
    }
}