import listener from './listener.mjs'
import { events, tests } from 'z-events'
if('content' in document.createElement('template')) {
    let cart = document.querySelector('#cart')
    let product = document.querySelector('#product')
    let productItem = document.querySelector('#product-item')
    let modal = document.querySelector('#modal-window')
    let docs = {
        course: {
            usd: document.querySelector('#panel_course')
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
            container: document.querySelector('.-cart__container')
        },
        modal: {
            window: document.querySelector('.window_modal'),
            edit: document.querySelector('.window_modal_edit'),
            close: document.querySelector('.window_modal_close'),
            save: document.querySelector('.window_modal_save')
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
                            let change = item.querySelector('.-products__container-item__details_item')
                            let name = item.querySelector('.-products__container-item__details_item_name')
                            let price = item.querySelector('.-products__container-item__details_item_price')
                            let available = item.querySelector('.-products__container-item__details_item_available')
                            if(props.change < 0) {
                                change.style.background ='#ed06063b'
                            } else if(props.change > 0) {
                                change.style.background ='#1ee11e40'
                            } else {
                                change.style.background = "white"
                            }
                            available.textContent = `${product.available}`
                            name.textContent = product.name
                            price.textContent = product.price.rub
                            listener.product.add(item);
                            details.appendChild(item)
                        }
                        container.appendChild(group)
                    }
                    docs.worker.postMessage({type:"resetChange"})
                    return true
                },
                cart: async (props) => {
                    let cart  = cart.content.cloneNode(true)
                    return cart
                },
                modal: async (element) => {
                    docs.modal.edit.innerHTML = ''
                    let item  = modal.content.cloneNode(true)
                    let oldValue = item.querySelector('.modal-window-value_old')
                    let newValue = item.querySelector('.modal-window-value_new')
                    let clone = element.target.cloneNode(true)
                    let className = clone.className
                    console.log('className', className)
                    oldValue.appendChild(clone)
                    docs.modal.edit.appendChild(item)
                    events.await('/save_modal', (event) => {
                        element.target.textContent = newValue.value
                        event.call(true)
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