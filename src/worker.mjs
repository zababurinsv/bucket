import api from './fs/api.mjs'
import FS from './fs/main.mjs'
import wasm from './fs/wasmBinary.mjs'
import ApiBack from './api.mjs'
let files = null;
let isSend = true
let course = {
  current: 80,
  change: 0
}
/**
 * factorial
 */
function heavyComputation (num) {
  for(let i = num - 1; i > 0; i--){
    num *= i;
  }
  return num;
}

let workerFS = FS({ wasmBinary: wasm })
workerFS.then(async (Module)=> {
  let FS = Module.FS
  FS.mkdir('/data');
  FS.api = await api(FS)
  FS.mount(Module.FS.filesystems.WORKERFS, {
    files: files,
    blobs: []
  }, '/data');
})

self.onmessage = async (events) => {
  switch (events.data.type) {
    case 'modal':
      isSend = events.data.isSend
      break
    case 'course':
      isSend = false
      course = await ApiBack.set.course(events.data.course)
      isSend = true
      break
    case 'resetChange':
      isSend = false
      await ApiBack.reset.courseChange()
      isSend = true
      break
    default:
      console.warn('неопределён тип события', events.data)
      break
  }
  if(events.data.isSend)
  console.log(events.data)
  self.postMessage("Got it");
}

let count = 0
let timerId = setTimeout(async function tick() {
  if(isSend) {
    let result = await ApiBack.get.products()
    self.postMessage({
      tick: count,
      isSend: isSend,
      data: result,
      course: course.change
    });
  }
  count = (count === 100) ? 0 : count + 1
  timerId = setTimeout(tick, 13323000);
}, 0);