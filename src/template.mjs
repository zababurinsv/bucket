import listener from './listener.mjs'
export default async ( type=" ", docs = { }, data = { } ) => {
	switch(type) {
		case'cart':
			docs.cart.container.innerHTML = ''
			await docs.get.template.cart(data.cart)
			break;
		case'products':
			console.log()
			let container = document.querySelector('.-products__container-item__details')
			let items =  document.querySelectorAll('.-products__container-item__details_item')
			if(items.length !== 0) {
				container.innerHTML = ''
				listener.product.terminate(items)
			}
			await docs.get.template.product(data)
			break;
		default:
			console.warn('неизвестный темплейт')
			break;
	}
}
