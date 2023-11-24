import React, {useCallback, useEffect, useReducer} from 'react';
import PropTypes from 'prop-types';
import {getLogger} from '../core';
import {SongProps} from './SongProps';
import {createSong, getSongs, newWebSocket, updateSong} from './SongApi';
import {useNetwork} from "../hooks/useNetwork";

const log = getLogger('SongProvider');

type SaveSongFn = (song: SongProps) => Promise<any>;

export interface SongsState {
    songs?: SongProps[],
    fetching: boolean,
    fetchingError?: Error | null,
    saving: boolean,
    savingError?: Error | null,
    saveSong?: SaveSongFn,
    unsent?: SongProps[]
}

interface ActionProps {
    type: string,
    payload?: any,
}

const initialState: SongsState = {
    fetching: false,
    saving: false,
    unsent: []
};

const FETCH_SONGS_STARTED = 'FETCH_SONGS_STARTED';
const FETCH_SONGS_SUCCEEDED = 'FETCH_SONGS_SUCCEEDED';
const FETCH_SONGS_FAILED = 'FETCH_SONGS_FAILED';
const FETCH_SONGS_OFFLINE = 'FETCH_SONGS_OFFLINE';
const SAVE_SONG_STARTED = 'SAVE_SONG_STARTED';
const SAVE_SONG_SUCCEEDED = 'SAVE_SONG_SUCCEEDED';
const SAVE_SONG_FAILED = 'SAVE_SONG_FAILED';
const RECONNECTED = 'RECONNECTED';

const reducer: (state: SongsState, action: ActionProps) => SongsState =
    (state, {type, payload}) => {
        switch (type) {
            case FETCH_SONGS_STARTED:
                return {...state, fetching: true, fetchingError: null};
            case FETCH_SONGS_SUCCEEDED:
                return {...state, songs: payload.songs, fetching: false};
            case FETCH_SONGS_OFFLINE:
                return {...state, fetching: false};
            case FETCH_SONGS_FAILED:
                return {...state, fetchingError: payload.error, fetching: false};
            case SAVE_SONG_STARTED:
                return {...state, savingError: null, saving: true};
            case SAVE_SONG_SUCCEEDED:
                const songs = [...(state.songs || [])];
                const song = payload.song;
                const index = songs.findIndex(it => it.id === song!.id!);
                if (index === -1) {
                    songs.splice(0, 0, song);
                } else {
                    songs[index] = song;
                }
                return {...state, songs, saving: false};
            case SAVE_SONG_FAILED:
                return {...state, savingError: payload.error, saving: false};
            case RECONNECTED:
                console.log("unsent items", state.unsent);
                return {...state, unsent: []};
            default:
                return state;
        }
    };

export const SongContext = React.createContext<SongsState>(initialState);

interface SongProviderProps {
    children: PropTypes.ReactNodeLike,
}

export function sendSongs(token: string, networkStatus: any){
    if(!networkStatus.connected){
        log("Offline, can't send items");
        return;
    }

    (async () => {
        const keys = [];
        for (let i = 0, len = localStorage.length; i < len; ++i) {
            //keys.push(localStorage.getItem(localStorage.key(i)!));
            keys.push(localStorage.key(i)!);
            console.log("keys", localStorage.key(i)!);
        }
        //const keys = (await localStorage).keys;
        if (keys.length === 0)
            return;

        for (const key of keys) {
            if (key === "token" || key!.startsWith("photo_") || key === "debug")
                continue;

            const song = await localStorage.getItem(key!);
            //console.log("SONG IN sendSongs", song, JSON.parse(song!));
            const songData = JSON.parse(song!);
            const decodedSong: SongProps = {
                id: songData.id,
                title: songData.title,
                author: songData.author,
                releaseDate: songData.releaseDate,
                playCount: songData.playCount,
                liked: songData.liked,
                latitude: songData.latitude,
                longitude: songData.longitude,
                photoBase64: songData.photoBase64
            };

            if (songData.isNew)
                await createSong(token, decodedSong);
            else
                await updateSong(token, decodedSong);

            await localStorage.removeItem(key!);
        }
    })();
}

function nextId(songs: SongProps[]){
    return Math.max(...(songs.map(s => Number(s.id || "-1")))) + 1;
}

export const SongProvider: React.FC<SongProviderProps> = ({children}) => {
    //const {token} = useContext(AuthContext);
    const token = localStorage.getItem("token");
    console.log("TOKEN HERE!!!!", token);
    const [state, dispatch] = useReducer(reducer, initialState);
    const {songs, fetching, fetchingError, saving, savingError, unsent} = state;
    const {networkStatus} = useNetwork();
    const saveSong = useCallback<SaveSongFn>(is => saveSongCallback(is, networkStatus, songs!), [networkStatus, token, songs, saveSongCallback]);

    useEffect(getSongsEffect, [token]);
    useEffect(wsEffect, [token]);
    useEffect(() => sendSongs(token!, networkStatus), [networkStatus, token]);

    //const saveSong = useCallback<SaveSongFn>(saveSongCallback, []);
    const value = {songs, fetching, fetchingError, saving, savingError, saveSong};

    log('returns');

    return (
        <SongContext.Provider value={value}>
            {children}
        </SongContext.Provider>
    );

    function getSongsEffect() {
        let canceled = false;
        fetchSongs();
        return () => {
            canceled = true;
        }

        async function fetchSongs() {
            try {
                log('fetchSongs started');
                dispatch({type: FETCH_SONGS_STARTED});
                if(!networkStatus.connected){
                    log("Offline, trying to fetch items...");
                    dispatch({type: FETCH_SONGS_OFFLINE, payload: {}});
                }
                const songs = await getSongs(token!, 1);
                console.log('SONGS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!', songs);
                log('fetchSongs succeeded');
                if (!canceled) {
                    dispatch({type: FETCH_SONGS_SUCCEEDED, payload: {songs}});
                }
            } catch (error) {
                log('fetchSongs failed');
                if (!canceled) {
                    dispatch({type: FETCH_SONGS_FAILED, payload: {error}});
                }
            }
        }
    }

    async function saveSongCallback(song: SongProps, networkStatus: any, songs: SongProps[]) {
        try {
            log('saveSong started');
            dispatch({type: SAVE_SONG_STARTED});
            if (!networkStatus.connected) {
                log("Offline, can't send songs to server");
                alert("You're offline. The song has been added to the list, but it hasn't been synced with the server just yet. Don't worry, you didn't lose any data.");
                const songId = song.id || nextId(songs).toString();
                await localStorage.setItem(songId, JSON.stringify({...song, isNew: song.id === undefined}));
                dispatch({type: SAVE_SONG_SUCCEEDED, payload: {song: song}});
            }
            else {
                const savedSong = await (song.id ? updateSong(token!, song) : createSong(localStorage.getItem("token")!, song));
                log('saveSong succeeded');
                console.log('song to be saved', song);
                dispatch({type: SAVE_SONG_SUCCEEDED, payload: {song: savedSong}});
            }
        } catch (error) {
            log('saveSong failed');
            dispatch({type: SAVE_SONG_FAILED, payload: {error}});
        }
    }

    function wsEffect() {
        let canceled = false;
        log('wsEffect - connecting');
        const closeWebSocket = newWebSocket(token!, message => {
            if (canceled) {
                return;
            }
            const {event, payload: {song}} = message;
            log(`ws message, song ${event}`);
            if (event === 'created' || event === 'updated') {
                dispatch({type: SAVE_SONG_SUCCEEDED, payload: {song}});
            }
        });

        return () => {
            log('wsEffect - disconnecting');
            canceled = true;
            closeWebSocket();
        }
    }

};
