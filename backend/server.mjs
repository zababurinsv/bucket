import app from './server__main_index.mjs'

let port = process.env.PORT || 5877
app.listen(port ,() => {
    console.log('pid: ', process.pid)
    console.log('listening on http://localhost:'+ port);
});
