let getData = async  (path) => {
    try {
        let data = await fetch(path)
        data = await data.json()
        return data
    }catch(e) {
        console.error(e)
    }
}

export default {
    get: {
        data: getData
    }
}
