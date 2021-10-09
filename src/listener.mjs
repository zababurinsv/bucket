import { events } from 'z-events'
import template from './template.mjs'
import cart from './cart.mjs'
let self = {}
let clicks = 0
let parentNode = async (event, type) => {
    let parent = {}
    let isParent = true
    if(event.target.classList.contains(type)) {
        parent = event.target
    } else {
        isParent = false
        parent =  event.target.parentNode
        while (!parent.classList.contains(type)) {
            parent = parent.parentNode
        }
    }
    return {
        parent: parent,
        isParent: isParent
    }
}

let timerId = null;

let closeModal = (event) => {
    self.modal.window.close()
    self.worker.postMessage({isSend: true, type: "modal"})
}

let saveModal = (event) => {
    self.modal.window.close()
    events.send('/save_modal', { }, (event) => {
        self.worker.postMessage({isSend: true, type: "modal"})
    })
}

let clickListener = (event) => {
    event.preventDefault()
    if (!timerId) {
        timerId = setTimeout(async () => {
            timerId = clearTimeout(timerId)
            let parent = await parentNode(event,'-products__container-item__details_item')
            if(!parent.isParent) {
                self.get.template.cart()
            }
        }, 200);
    } else {
        timerId = clearTimeout(timerId)
    }
}

let doubleClickListener = async (event) => {
    self.worker.postMessage({isSend: false, type: "modal"})
    self.modal.window.close()
    let parent = await parentNode(event,'-products__container-item__details_item')
    if(!parent.isParent) {
        self.get.template.modal({
            target: event.target,
            parentNode: parent
        })
        self.modal.window.show()
    }
}

let changeCourse = (event) => {
    event.preventDefault()
    if(self.course.usd.value < 20 || self.course.usd.value > 80) {
        alert("Курс должен быть не наже 20 и не выше 80 рублей");
    } else {
        self.worker.postMessage({
            type:"course",
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
                template("products", docs, {
                 data: msg.data.data,
                 change: parseFloat(msg.data.course)
                });
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
}

let product = (docs) => {
    let item = docs.querySelector('.-products__container-item__details_item')
    item.addEventListener('click', clickListener)
    item.addEventListener('dblclick', doubleClickListener );
}

let terminate = (items) => {
    for(let item of items) {
      item.removeEventListener('click', clickListener);
      item.removeEventListener('dblclick', doubleClickListener );
    }
}

let course = (docs) => {
    self = docs
    docs.panel.course.addEventListener('click', changeCourse)
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
    }
}