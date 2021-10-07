export default () => {
    let worker = new Worker(new URL('./worker.mjs', import.meta.url), { type: "module" })

    worker.onmessage = msg => {
        // console.log("[Main thread] Got message back:", msg.data.tick);
    }

    worker.onerror = function(event) {
        console.log('There is an error with your worker!', event);
    }

}