import { useCallback, useEffect, useReducer } from 'react';
import { getLogger } from '../core';
import { getSongs } from './SongApi';

const log = getLogger('useSongs');

export interface SongsState {
  songs?: SongProps[],
  fetching: boolean,
  fetchingError?: Error,
}

export interface SongProps extends SongsState {
  addSong: () => void,
}

interface ActionProps {
  type: string,
  payload?: any,
}

const initialState: SongsState = {
  songs: undefined,
  fetching: false,
  fetchingError: undefined,
};

const FETCH_SONGS_STARTED = 'FETCH_SONGS_STARTED';
const FETCH_SONGS_SUCCEEDED = 'FETCH_SONGS_SUCCEEDED';
const FETCH_SONGS_FAILED = 'FETCH_SONGS_FAILED';

const reducer: (state: SongsState, action: ActionProps) => SongsState =
  (state, { type, payload }) => {
    switch(type) {
      case FETCH_SONGS_STARTED:
        return { ...state, fetching: true };
      case FETCH_SONGS_SUCCEEDED:
        return { ...state, songs: payload.songs, fetching: false };
      case FETCH_SONGS_FAILED:
        return { ...state, fetchingError: payload.error, fetching: false };
      default:
        return state;
    }
  };

export const useSongs: () => SongProps = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { songs, fetching, fetchingError } = state;
  const addSong = useCallback(() => {
    log('addSong - TODO');
  }, []);
  useEffect(getSongsEffect, [dispatch]);
  log(`returns - fetching = ${fetching}, songs = ${JSON.stringify(songs)}`);
  return {
    songs,
    fetching,
    fetchingError,
    addSong,
  };

  function getSongsEffect() {
    let canceled = false;
    fetchSongs();
    return () => {
      canceled = true;
    }

    async function fetchSongs() {
      try {
        log('fetchSongs started');
        dispatch({ type: FETCH_SONGS_STARTED });
        const items = await getSongs();
        log('fetchSongs succeeded');
        if (!canceled) {
          dispatch({ type: FETCH_SONGS_SUCCEEDED, payload: { items } });
        }
      } catch (error) {
        log('fetchSongs failed');
        if (!canceled) {
          dispatch({ type: FETCH_SONGS_FAILED, payload: { error } });
        }
      }
    }
  }
};
