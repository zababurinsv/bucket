import back from "./back.mjs";
import isEmpty from "./isEmpty.mjs";
import calc from "./calc.mjs";

let course = async (newCourse) => {
   return await calc.set.course(newCourse)
}

let resetChange = async () => {
    return await calc.reset.change()
}

let products = () => {
    return  new Promise(async (resolve, reject) => {
        try {
            /**
             * Проверки на наличие данный не стал делать в данном случае
             */
            let data = (await back.get.data('https://zababurinsv.github.io/tests/07_10_2021/data.json')).Value.Goods
            let names = await back.get.data('https://zababurinsv.github.io/tests/07_10_2021/names.json')
            const name = new Map();
            let result = {}
            let products = {};
            for(let item of data) {
                (isEmpty(products[`${item.G}`]))
                    ? (products[`${item.G}`] = [], products[`${item.G}`].push(item))
                    : products[`${item.G}`].push(item)
            }

            for(let key in names) {
                name.set(key, {
                    name: names[key].G,
                    id: names[key].B
                })
            }

            for (let id in products) {
                if(isEmpty(result[`${name.get(`${id}`).name}`])) {
                    result[`${name.get(`${id}`).name}`] = []
                }
                for(let item in products[id]) {
                    result[`${name.get(`${id}`).name}`].push({
                        name: name.get(`${id}`).id[`${products[id][item].T}`].N,
                        id: products[id][item].T,
                        available:  products[id][item].P,
                        price: {
                            usd: products[id][item].C,
                            rub: calc.convert(products[id][item].C)
                        },
                        group: products[id][item].G,
                        B: products[id][item].B,
                        CV: products[id][item].CV,
                        Pl: products[id][item].Pl,
                    })
                }
            }
            resolve(result)
        }catch (e) {
            console.error(e)
            resolve(e)
        }
    })
}

export default {
    get: {
        products: products
    },
    set: {
     course: course
    },
    reset: {
        courseChange: resetChange
    }

}