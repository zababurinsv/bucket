//import { events } from 'z-events'
import template from './template.mjs'

export default (docs = { }) => {
    return new Promise(async (resolve, reject) => {
        let manager = await import("https://zababurinsv.github.io/z-events/index.min.mjs");

        template(bucket, docs);
        
        docs.worker.onmessage = msg => {

            console.log("tick", msg.data.tick);
        }

        docs.worker.onerror = function(event) {
            console.log('There is an error with your worker!', event);
        }

        manager.events.await('/get_data', (event) => {
      
            event.call(true)
      
        })

        resolve(true)
    })
}