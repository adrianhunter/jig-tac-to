require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http').createServer(app);
const Run = require('./run/dist/run.node.min');
const EventEmitter = require('events');
const Overpool = require('overpool');

const poolServer = new Overpool();
const poolOpponent = new Overpool();

let discoveryKey;
let JigTacTo;
const run = new Run({
    network: 'test',
    owner: process.env.OWNER,
    purse: process.env.PURSE
});

const LOC = '390ea1bf36cafdaf93de5cfc68f06664a922cf3c161f48bd97db13fba191150e_o1';

const jigs = new Set();
class Watcher extends EventEmitter {
    constructor() {
        super();

        setInterval(async () => {
            this.checkJigs();
        }, 30000);
        this.checkJigs();
    }

    async checkJigs() {
        await run.owner.sync();
        for (let jig of run.owner.jigs) {
            if (!jigs.has(jig.location)) {
                if (jig.constructor.origin !== LOC) continue;
                jigs.add(jig.location);
                console.log('Jig:', jig.constructor.name, jig.origin, jig.location)
                this.emit('jig', jig);
            }
        }
    }
}

let currentJig;
const watcher = new Watcher();

watcher.on('jig', async (jig) => {
    console.log('ON JIG:', jig.stage);
    try {
        if (jig.stage === 'challenged') {
            poolOpponent.sub({ path: jig.x.poolId })
            jig.accept(discoveryKey);
            await jig.sync();
            currentJig = jig;
            console.log('Accepted');
            // writeEvent();
        } else if (jig.stage === 'accepted') {
            poolOpponent.sub({ path: jig.o.poolId });
            currentJig = jig;
            console.log('Listening');
            // writeEvent();
        } else if (jig.state === 'open') {
            const message = `${jig.location} ${jig.board}`;
            console.log('sending', message)
            // writeEvent(message);
        }
    }
    catch (e) {
        console.error(e);
    }
});

poolOpponent.on('tx', (e) => {
    console.log(JSON.stringify(e));
});

async function notifyJig(jig) {
    try {
        if (jig.stage === 'open' || jig.stage === 'accepted') {
            socket.emit(jig);
        }
    }
    catch (e) {
        console.error(e);
    }
}

app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
    console.log('REQ:', req.path);
    next();
});
app.post('/challenge', (req, res) => {
    console.log(req.body);
    const { pubKey } = req.body;
    const game = new JigTacTo(pubKey, discoveryKey);
});

app.get('/pubkey', (req, res) => {
    res.json(run.owner.pubkey);
});

app.get('/jigs', (req, res) => {
    // SSE Setup
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    });
    res.write('\n');
    console.log('Watcher Connected');

    watcher.on('jig', (jig) => {
        res.write(`data: ${jig.location} - ${JSON.stringify(jig.board)}\n\n`);
    })
});

http.listen(3001, async () => {
    try {
        JigTacTo = await run.load(LOC);
        await poolServer.create({
            path: "jigtacto",
            port: 9999
        });
        discoveryKey = await poolServer.pub({ path: "jigtacto" });
        console.log('listening on *:3001');
    } catch (e) {
        console.error(e);
    }

});