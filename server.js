require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const Run = require('./run/dist/run.node.min');
const EventEmitter = require('events');
const Overpool = require('overpool');

const pool = new Overpool();
let discoveryKey;
let JigTacTo;
const run = new Run({
    network: 'test',
    owner: process.env.OWNER,
    purse: process.env.PURSE
});

class Watcher extends EventEmitter {
    constructor() {
        super();
        this.jigs = new Set();

        setInterval(async () => {
            await run.owner.sync();
            for (let jig of run.owner.jigs) {
                if (!this.jigs.has(jig.location)) {
                    this.jigs.set(jig.location);
                    this.emit('jig', jig);
                }
            }
        }, 15000);
    }
}

const watcher = new Watcher();

io.on('connection', function (socket) {
    console.log('a user connected');
    watcher.on('jig', (jig) => {
        if (jig.stage === 'challenge') {
            jig.accept(discoveryKey);
        } else if (jig.stage === 'open') {
            socket.emit(jig);
        }

    })
});

app.use(express.json());
app.post('/challenge', (req, res) => {
    const { pubKey } = req.body;
    const game = new JigTacTo(pubKey, discoveryKey);
})

http.listen(3001, async () => {
    try {
        JigTacTo = await run.load('751f7113b60491902cec59a00e378bdeb0119a6f0929be1573eb5ca58fbf6c8c_o1');
        await pool.create({
            path: "jigtacto",
            port: 9999
        });
        discoveryKey = await pool.pub({ path: "jigtacto" })
        console.log('listening on *:3001');
    } catch (e) {
        console.error(e);
    }

});