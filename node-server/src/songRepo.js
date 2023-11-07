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

        await this.db.exec(`
            create table if not exists songs
            (
                id          integer primary key autoincrement,
                title       text,
                author      text,
                releaseDate text,
                playCount   integer,
                liked       integer,
                userId      text
            )
        `);
    };

    async getAll(userId) {
        return await this.db.all("select * from songs where userId = ?", [userId]);
    }

    async getSongById(songId) {
        return await this.db.get("select * from songs where id = ?", [songId]);
    }

    async addSong(song) {
        const {title, author, releaseDate, playCount, liked, userId} = song;
        if (!title || !author) {
            throw new Error("Invalid data.");
        }
        await this.db.insert("insert into songs (title, author, releaseDate, playCount, liked, userId) values (?, ? ,?, ?, ?, ?)",
            [title, author, releaseDate, playCount, liked, userId]);

        const lastId = await this.db.get("select last_insert_rowid() as lastId");
        song.id = lastId.toString();
        return song;
    }

    async deleteSong(songId) {
        // run is used for single queries, exec for multiple queries
        return await this.db.run("delete from songs where id = ?", [songId]);
    }

    async updateSong(songId, song) {
        const {title, author, releaseDate, playCount, liked} = song;
        const result = await this.db.run("update songs set title = ?, author = ? , releaseDate = ?, playCount = ?, liked = ? where id = ?",
            [title, author, releaseDate, playCount, liked, songId]);
        return 1;
    }
}

const songRepo = new SongRepo({filename: "C:\\Users\\GIGABYTE\\IdeaProjects\\PDM\\node-server\\db\\songs.db"});
await songRepo.createTable();

export {songRepo};