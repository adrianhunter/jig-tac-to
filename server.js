require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
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

const LOC = '550a77554bd91384f7e5b34915e6ef1d986be3d92b4023ca580de9b9b2abc4a1_o1';

const jigs = new Set();
class Watcher extends EventEmitter {
    constructor() {
        super();

        setInterval(async () => {
            await run.owner.sync();
            for (let jig of run.owner.jigs) {
                if (!jigs.has(jig.location)) {
                    if (jig.constructor.origin !== LOC) continue;
                    jigs.add(jig.location);
                    console.log('Jig:', jig.constructor.name, jig.origin, jig.location)
                    this.emit('jig', jig);
                }
            }
        }, 15000);
    }
}

const watcher = new Watcher();
watcher.on('jig', async (jig) => {
    console.log('ON JIG:', jig.stage);
    try {
        if (jig.stage === 'challenge') {
            jig.accept(discoveryKey);
            await jig.sync();
            console.log('Updated');
        }
    }
    catch (e) {
        console.error(e);
    }
});

io.on('connection', (socket) => {
    console.log('a user connected');
    watcher.on('jig', async (jig) => {
        // console.log('ON JIG:', jig.stage);
        try {
            if (jig.stage === 'open') {
                socket.emit(jig);
            }
        }
        catch (e) {
            console.error(e);
        }
    });

    socket.on('')
});

app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
    console.log('REQ:', req.path);
    next();
})
app.post('/challenge', (req, res) => {
    console.log(req.body);
    const { pubKey } = req.body;
    const game = new JigTacTo(pubKey, discoveryKey);
})

http.listen(3001, async () => {
    try {
        JigTacTo = await run.load(LOC);
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