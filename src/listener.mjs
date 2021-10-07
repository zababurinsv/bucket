import { events } from 'z-events'

export default (docs = { }) => {
    return new Promise(async (resolve, reject) => {
        docs.worker.onmessage = msg => {

            console.log("tick", msg.data.tick);
        }

        docs.worker.onerror = function(event) {

            console.log('There is an error with your worker!', event);

        }

        events.await('/get_data', (event) => {
            event.call(true)
        })

        resolve(true)
    })
}