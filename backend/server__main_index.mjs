import fs from "fs";
import path from "path";
let __dirname = path.dirname(process.argv[1]);
import dotenv from "dotenv"
dotenv.config()
import express from "express";
import cors from "cors";
import Enqueue from "express-enqueue";
import compression from "compression";
const highWaterMark =  2;
import formidableMiddleware from "express-formidable";
let app = express();
app.use(compression())
app.use(cors({ credentials: true }));
app.use(formidableMiddleware());
const queue = new Enqueue({
    concurrentWorkers: 4,
    maxSize: 200,
    timeout: 30000
});
app.use(queue.getMiddleware());
app.use( express.static('src'));

app.get('/*', async (req, res) => {
    res.sendFile('/src/index.html', { root: __dirname });
})
app.use(queue.getErrorMiddleware())
export default app