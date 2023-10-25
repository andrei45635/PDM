const Koa = require('koa');
const app = new Koa();
const server = require('http').createServer(app.callback());
const WebSocket = require('ws');
const wss = new WebSocket.Server({server});
const Router = require('koa-router');
const cors = require('koa-cors');
const bodyparser = require('koa-bodyparser');

app.use(bodyparser());
app.use(cors());

app.use(async (ctx, next) => {
    const start = new Date();
    await next();
    const ms = new Date() - start;
    console.log(`${ctx.method} ${ctx.url} ${ctx.response.status} - ${ms}ms`);
});

app.use(async (ctx, next) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    await next();
});

app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        ctx.response.body = {issue: [{error: err.message || 'Unexpected error'}]};
        ctx.response.status = 500;
    }
});

class Song {
    constructor({id, title, author, releaseDate, playCount, liked, version}) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.releaseDate = releaseDate;
        this.playCount = playCount;
        this.liked = liked;
        this.version = version;
    }
}

const songs = [];
// for (let i = 0; i < 3; i++) {
//   items.push(new Song({ id: `${i}`, text: `item ${i}`, date: new Date(Date.now() + i), version: 1 }));
// }
let lastUpdated = new Date();
let lastId = 0; //start with 0
const pageSize = 10;

const broadcast = data =>
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });

const router = new Router();

router.get('/song', ctx => {
    ctx.response.body = songs;
    ctx.response.status = 200;
});

router.get('/song/:id', async (ctx) => {
    const songID = ctx.request.params.id;
    const song = songs.find(item => songID === item.id);
    if (song) {
        ctx.response.body = song;
        ctx.response.status = 200; // ok
    } else {
        ctx.response.body = {message: `Song with id ${songID} not found`};
        ctx.response.status = 404; // NOT FOUND (if you know the resource was deleted, then return 410 GONE)
    }
});

const createSong = async (ctx) => {
    const song = ctx.request.body;
    if (!song.title || !song.releaseDate || !song.playCount) { // validation
        ctx.response.body = {message: 'Invalid song!'};
        ctx.response.status = 400; //  BAD REQUEST
        return;
    }
    const newSong = new Song({
        id: lastId++,
        title: song.title,
        author: song.author,
        releaseDate: song.releaseDate,
        playCount: song.playCount,
        liked: song.liked,
        version: song.version,
    });

    songs.push(newSong);
    ctx.response.body = newSong;
    ctx.response.status = 201; // CREATED
    broadcast({event: 'created', payload: {song: newSong}});
};

router.post('/song', async (ctx) => {
    await createSong(ctx);
});

router.put('/song/:id', async (ctx) => {
    const id = ctx.params.id;
    const song = ctx.request.body;
    song.releaseDate = new Date();
    const songID = song.id;
    if (songID && parseInt(id) !== song.id) {
        ctx.response.body = {message: `Param id and body id should be the same`};
        ctx.response.status = 400; // BAD REQUEST
        return;
    }
    if (!song) {
        await createSong(ctx);
        return;
    }
    const index = songs.findIndex(item => item.id === parseInt(id));
    if (index === -1) {
        ctx.response.body = {issue: [{error: `Song with id ${id} not found`}]};
        ctx.response.status = 400; // BAD REQUEST
        return;
    }
    const songVersion = parseInt(ctx.request.get('ETag')) || song.version;
    if (songVersion < songs[index].version) {
        ctx.response.body = {issue: [{error: `Version conflict`}]};
        ctx.response.status = 409; // CONFLICT
        return;
    }
    song.version++;
    songs[index] = song;
    lastUpdated = new Date();
    ctx.response.body = song;
    ctx.response.status = 200; // OK
    broadcast({event: 'updated', payload: {song}});
});

router.del('/song/:id', ctx => {
    const id = ctx.params.id;
    const index = songs.findIndex(item => parseInt(id) === item.id);
    if (index !== -1) {
        const song = songs[index];
        songs.splice(index, 1);
        lastUpdated = new Date();
        broadcast({event: 'deleted', payload: {song}});
    }
    ctx.response.status = 204; // no content
});

// setInterval(() => {
//     lastUpdated = new Date();
//     lastId = `${parseInt(lastId) + 1}`;
//     const song = new Song({id: lastId, text: `item ${lastId}`, date: lastUpdated, version: 1});
//     items.push(item);
//     console.log(`New item: ${item.text}`);
//     broadcast({event: 'created', payload: {item}});
// }, 5000);

app.use(router.routes());
app.use(router.allowedMethods());

server.listen(3000, () => {
    console.log('Server started on port 3000');
});

wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    ws.on('message', (message) => {
        console.log(`Received: ${message}`);
    });
    ws.on('close', () => {
        console.log('WebSocket client disconnected');
    });
});
