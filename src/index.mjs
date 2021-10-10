import listener from './listener.mjs'
import { events, tests } from 'z-events'
if('content' in document.createElement('template')) {
    let cartItem = document.querySelector('#cart-item')
    let product = document.querySelector('#product')
    let productItem = document.querySelector('#product-item')
    let modal = document.querySelector('#modal-window')
    let docs = {
        course: {
            usd: document.querySelector('#panel_course'),
            current: document.querySelector('.course__current')
        },
        create: {
            group: async (name) => {
                let  group  = product.content.cloneNode(true)
                let  summary = group.querySelector('summary')
                let  details = group.querySelector('.-products__container-item__details')
                summary.textContent = name
                return {
                    group: group,
                    summary: summary,
                    details: details
                }
            }
        },
        isGroup: false,
        panel: {
            course: document.querySelector('.course__button'),
        },
        product: {
            parent: document.querySelector('.-products'),
            container:  document.querySelector('.-products__container')
        },
        cart: {
            parent: document.querySelector('.-cart'),
            container: document.querySelector('.-cart__container'),
            total: document.querySelector('.-cart__footer_total_price')
        },
        modal: {
            window: document.querySelector('.window_modal'),
            edit: document.querySelector('.window_modal_edit'),
            close: document.querySelector('.window_modal_close'),
            save: document.querySelector('.window_modal_save'),
            background: document.querySelector('.window_modal_background'),
        },
        get: {
            template: {
                product:  async (props) => {
                    let container = document.querySelector('.-products__container')
                    let groups = document.querySelectorAll('.-products__container-item')
                    for(let key in props.data) {
                        let details = {}
                        let group = {}
                        let summary = {}
                        if(groups.length === 0) {
                            let obj = await docs.create.group(key)
                            group =   obj.group
                            summary = obj.summary
                            details = obj.details
                        } else {
                            for(let type of groups) {
                                if(key.trim() === type.querySelector('summary').textContent.trim()) {
                                    group = type
                                    details = group.querySelector('.-products__container-item__details')
                                    details.innerHTML = ''
                                    docs.isGroup = true
                                    break
                                }
                            }
                            if(!docs.isGroup) {
                                let obj = await docs.create.group(key)
                                group =   obj.group
                                summary = obj.summary
                                details = obj.details
                            }
                        }
                        for(let product of props.data[key]) {
                            let item  = productItem.content.cloneNode(true)

                            let group = item.querySelector('.-products__container-item__details_item_group')
                            let id = item.querySelector('.-products__container-item__details_item_id')
                            let change = item.querySelector('.-products__container-item__details_item')
                            let name = item.querySelector('.-products__container-item__details_item_name')
                            let price = item.querySelector('.-products__container-item__details_item_price')
                            let available = item.querySelector('.-products__container-item__details_item_available')
                            let priceUsd = item.querySelector('.-products__container-item__details_item_price-usd')
                            if(props.change < 0) {
                                change.style.background ='#ed06063b'
                            } else if(props.change > 0) {
                                change.style.background ='#1ee11e40'
                            } else {
                                change.style.background = "white"
                            }
                            group.textContent = key
                            id.textContent = product.id
                            available.textContent = `${product.available}`
                            name.textContent = product.name
                            price.textContent = product.price.rub
                            priceUsd.textContent = product.price.usd
                            listener.product.add(item);
                            details.appendChild(item)
                        }
                        container.appendChild(group)
                    }
                    docs.worker.postMessage({type:"reset-change"})
                    return true
                },
                cart: async (props) => {
                    let total = 0;
                    for(let type in props) {
                        for(let id in props[type]) {
                            let item  = cartItem.content.cloneNode(true)
                            let name = item.querySelector('.-cart__container_item_name')
                            let quantity = item.querySelector('.-cart__container_item_quantity')
                            let remove = item.querySelector('.-cart__container_item_remove')
                            let price = item.querySelector('.-cart__container_item_price')
                            let groupId = item.querySelector('.-cart__container_item_groupId')
                            let productId = item.querySelector('.-cart__container_item_productId')

                            total += total + props[type][id].length * props[type][id][0].price
                            productId.textContent = id
                            groupId.textContent = type
                            price.textContent = props[type][id][0].price
                            name.textContent = props[type][id][0].name
                            quantity.textContent = props[type][id].length
                            listener.cart.remove(remove)
                            docs.cart.container.appendChild(item)
                        }
                    }
                    docs.cart.total.textContent = total.toFixed(2)
                    return true
                },
                modal: async (element) => {
                    let object = element
                    docs.modal.edit.innerHTML = ''
                    let item  = modal.content.cloneNode(true)
                    let oldValue = item.querySelector('.modal-window-value_old')
                    let newValue = item.querySelector('.modal-window-value_new')
                    let clone = element.target.cloneNode(true)
                    oldValue.appendChild(clone)
                    docs.modal.edit.appendChild(item)
                    docs.worker.postMessage({isSend: false, type: "update"})
                    events.await('/save_modal',async (events) => {
                        docs.modal.edit.innerHTML = ''
                        element.target.textContent = newValue.value
                        let group = (element.parentNode.parent.querySelector('.-products__container-item__details_item_group')).textContent
                        let item = element.parentNode.parent
                        let id = parseFloat((item.querySelector('.-products__container-item__details_item_id').textContent))
                        let name = item.querySelector('.-products__container-item__details_item_name').textContent
                        let available = parseFloat((item.querySelector('.-products__container-item__details_item_available').textContent))
                        let price = parseFloat((item.querySelector('.-products__container-item__details_item_price').textContent))
                        let priceUsd = parseFloat((item.querySelector('.-products__container-item__details_item_price-usd').textContent))
                        let idGroup = group.trim()
                        events.call({
                            idProduct: id,
                            name: name,
                            available: available,
                            price: price,
                            priceUsd: priceUsd,
                            idGroup: idGroup
                        })
                    })
                    return true
                }
            }
        },
        template: {
            product: document.querySelector('#product'),
            cart: document.querySelector('#cart'),
        },
        worker: undefined
    };

    (async () =>  {
        await listener.modal.main(docs)
        await listener.panel.course(docs);
        // let manager = await import("https://zababurinsv.github.io/z-events/index.min.mjs");
        // manager.tests("https://zababurinsv.github.io/tests/07_10_2021/test_07_10_2021.index.mjs", false);
        tests("https://zababurinsv.github.io/tests/07_10_2021/test_07_10_2021.index.mjs", false);
        docs.worker = new Worker(new URL('./worker.mjs', import.meta.url), { type: "module" });
        await listener.worker(docs);
    })()
} else {
    //  let manager = await import("https://zababurinsv.github.io/z-events/index.min.mjs");
    // manager.devTool()
    console.warn('нет атрибута content у элемента template')
}