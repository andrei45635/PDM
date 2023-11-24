import sqlite3 from 'sqlite3';
import {open} from 'sqlite';

export class SongRepo {
    constructor({filename}) {
        this.filename = filename;
    }

    async createTable() {
        this.db = await open({
            filename: this.filename,
            driver: sqlite3.Database
        });

        await this.db.run(`
            create table if not exists songs
            (
                id          integer primary key autoincrement,
                title       text,
                author      text,
                releaseDate text,
                playCount   integer,
                liked       integer,
                userId      text,
                latitude    integer,
                longitude   integer, 
                photoBase64 text
            )
        `);
    };

    async getAll(userId) {
        return await this.db.all("select * from songs where userId = ?", [userId.userId]);
    }

    async getSongById(songId) {
        return await this.db.get("select * from songs where id = ?", [songId]);
    }

    async addSong(song) {
        const {title, author, releaseDate, playCount, liked, userId, latitude, longitude, photoBase64} = song;
        if (!title || !author) {
            throw new Error("Invalid data.");
        }
        await this.db.run("insert into songs (title, author, releaseDate, playCount, liked, userId, latitude, longitude, photoBase64) values (?, ? ,?, ?, ?, ?, ?, ?, ?)",
            [title, author, releaseDate, playCount, liked, userId, latitude, longitude, photoBase64]);

        const lastId = await this.db.get("select last_insert_rowid() as lastId");
        song.id = lastId.toString();
        return song;
    }

    async deleteSong(songId) {
        // run is used for single queries, exec for multiple queries
        return await this.db.run("delete from songs where id = ?", [songId]);
    }

    async updateSong(songId, song) {
        console.log('IN REPO DB', song);
        //const {title, author, releaseDate, playCount, liked, latitude, longitude, photoBase64} = song;
        const {title, author, releaseDate, playCount, liked, latitude, longitude, photoBase64} = song;
        const result = await this.db.run("update songs set title = ?, author = ? , releaseDate = ?, playCount = ?, liked = ?, latitude = ?, longitude = ?, photoBase64 = ? where id = ?",
            [title, author, releaseDate, playCount, liked, songId, latitude, longitude, photoBase64]);
        return 1;
    }
}

const songRepo = new SongRepo({filename: "C:\\Users\\z004tx9t\\Desktop\\PDM\\node-server\\db\\songs.db"});
await songRepo.createTable();

export {songRepo};