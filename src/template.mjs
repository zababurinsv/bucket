export default async ( type=" ", docs = { } ) => {
	switch(type) {
		case'bucket':
			for(let i = 0; i < 4; i++) {
				let item = await docs.get.template.bucket({
					colums: 4,
					position: i 
				})
				docs.bucket.container.appendChild(item)
			}
			break;
		default:
			console.warn('неизвестный темплейт')
			break;
	}
}
