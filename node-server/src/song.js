import Router from "koa-router";
import {broadcast} from "./wss.js";
import {songRepo} from "./songRepo.js";

export const songRouter = new Router();

const pageSize = 10;

songRouter.get("/:page", async (ctx) => {
    const userId = ctx.state.user._id;
    const songs = await songRepo.getAll({userId});
    songs.forEach(song => song.id = song.id.toString());
    ctx.response.body = songs.slice((ctx.params.page - 1) * pageSize, ctx.params.page * pageSize);
    ctx.response.status = 200; // ok
});

songRouter.get("/:id", async (ctx) => {
    const userId = ctx.state.user._id;
    const song = await songRepo.getSongById({_id: ctx.params.id});
    const response = ctx.response;
    if (song) {
        if (song.userId === userId) {
            ctx.response.body = song;
            ctx.response.status = 200; // ok
        } else {
            response.body = {message: "Unauthorized"}
            ctx.response.status = 403; // forbidden
        }
    } else {
        response.body = {message: "Couldn't find the request book"}
        ctx.response.status = 404; // not found
    }
});

const createSong = async (ctx, song, response) => {
    try {
        song.userId = ctx.state.user._id;
        console.log("userId", song.userId);
        response.body = await songRepo.addSong(song);
        response.status = 201; // created
        broadcast(song.userId, {type: "created", payload: song});
    } catch (err) {
        response.body = {message: err.message};
        response.status = 400; // bad request
    }
};

songRouter.post("/", async ctx => await createSong(ctx, ctx.request.body, ctx.response));

songRouter.put("/:id", async ctx => {
    const song = ctx.request.body;
    const id = ctx.params.id;
    const songId = song.id;
    const response = ctx.response;
    if (songId && songId !== id) {
        response.body = {message: "Param id and body _id should be the same"};
        response.status = 400; // bad request
        return;
    }
    console.log(song.id);
    if (!songId) {
        console.log("creating", song);
        await createSong(ctx, song, response);
    } else {
        console.log("updating", song)
        const userId = ctx.state.user._id;
        song.userId = userId;
        song.latitude = song.latitude || 0;
        song.longitude = song.longitude || 0;
        console.log("userId", song.userId);
        const updatedCount = await songRepo.updateSong({_id: parseInt(id)}, song);
        if (updatedCount === 1) {
            response.body = song;
            response.status = 200; // ok
            broadcast(userId, {type: "updated", payload: song});
        } else {
            response.body = {message: "Resource no longer exists"};
            response.status = 405; // method not allowed
        }
    }
});

songRouter.del("/:id", async (ctx) => {
    const userId = ctx.state.user._id;
    const song = await songRepo.getSongById({_id: ctx.params.id});
    if (song && userId !== song.userId) {
        ctx.response.body = {message: "Unauthorized"};
        ctx.response.status = 403; // forbidden
    } else {
        await songRepo.deleteSong({_id: ctx.params.id});
        ctx.response.body = {message: "Successfully deleted"};
        ctx.response.status = 204; // no content
        broadcast(song.userId, {type: "deleted", payload: song});
    }
});
