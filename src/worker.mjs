import api from './api.mjs'
import FS from './fs/main.mjs'
import wasm from './fs/wasmBinary.mjs'
import api from './api.mjs'
let container = null ;
let files = null;
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

self.onmessage = (events) => {
  console.log(events)
  self.postMessage("Got it");
}

function factorial(num){
  for(var i = num - 1; i > 0; i--){
    num *= i;
  }
  return num;
}
console.log('@@@@@@@',  api)
let count = 0
let timerId = setTimeout(function tick() {
  self.postMessage({
    tick: count
  });
  count = (count === 100) ? 0 : count + 1
  timerId = setTimeout(tick, 15000);
}, 15000);