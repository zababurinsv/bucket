let getData = async  (path) => {
    try {
       let data = await fetch(path)
            data = await data.json()
            return data
    }catch(e) {
        console.error()
    }
}

export default {
    get: {
        data: getData
    }
}
