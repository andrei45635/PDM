import React, {useContext, useEffect, useState} from 'react';
import {RouteComponentProps} from 'react-router';
import {
    IonButton,
    IonCheckbox,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon, IonInfiniteScroll, IonInfiniteScrollContent, IonItem,
    IonList, IonLoading,
    IonPage, IonRow, IonSearchbar,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import {add} from 'ionicons/icons';
import {getLogger} from '../core';
import {SongContext} from './SongProvider';
import Song from "./Song";
import SpotubeToolbar from "../components/SpotubeToolbar";
import {filterSongs, SongProps} from "./SongProps";
import {useNetwork} from "../network/useNetwork";
import {usePreferences} from "../network/usePreferences";
import {getSongs} from "./SongApi";

const log = getLogger('SongList');

const SongList: React.FC<RouteComponentProps> = ({history}) => {
    //const {songs, fetching, fetchingError} = useContext(SongContext);
    const {songs, fetching, fetchingError} = useContext(SongContext);

    const [titleFilter, setTitleFilter] = useState<string>("");
    const [authorFilter, setAuthorFilter] = useState<string>("");
    const [likedFilter, setLikedFilter] = useState<boolean>(false);

    const {networkStatus} = useNetwork();
    usePreferences();

    const [page, setPage] = useState(1); // Current page
    const itemsPerPage = 10; // Number of items per page

    const [disableInfiniteScroll, setDisableInfiniteScroll] = useState<boolean>(false);

    function onScroll(e:CustomEvent<void>){
        if(!networkStatus.connected){
            log("Offline: can't load more packages");
            (e.target! as HTMLIonInfiniteScrollElement).complete();
            return;
        }

        getSongs(localStorage.getItem("token")!, page + 1).then(newSongs => {
            songs?.push(...newSongs);
            setPage(page + 1);
            setDisableInfiniteScroll(newSongs.length < itemsPerPage);
            (e.target! as HTMLIonInfiniteScrollElement).complete();
        });
    }

    const isFilterApplied = () => titleFilter || authorFilter || likedFilter;

    // Function to clear all filters
    const clearFilters = () => {
        setTitleFilter("");
        setAuthorFilter("");
        setLikedFilter(false);
    };

    log('render');

    return (
        <IonPage>
            <IonHeader>
                {/*<IonToolbar>*/}
                {/*    <IonTitle>Spotube</IonTitle>*/}
                {/*</IonToolbar>*/}
                <SpotubeToolbar></SpotubeToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonLoading isOpen={fetching} message="Fetching songs"/>
                <IonRow>
                    <IonSearchbar
                        placeholder="Title"
                        value={titleFilter}
                        debounce={100}
                        onIonChange={e => setTitleFilter(e.detail.value!)}
                        style={{width:"25%"}}
                    >
                    </IonSearchbar>
                    <IonSearchbar
                        placeholder="Author"
                        value={authorFilter}
                        debounce={100}
                        onIonChange={e => setAuthorFilter(e.detail.value!)}
                        style={{width:"25%"}}
                    >
                    </IonSearchbar>
                    <IonItem style={{width:"25%"}}>
                        Liked
                        <div style={{margin:"15px"}}>
                            <IonCheckbox
                                checked={likedFilter}
                                onIonChange={e => setLikedFilter(e.detail.checked ?? false)}
                            />
                        </div>

                    </IonItem>
                    {isFilterApplied() && (
                        <IonItem style={{ margin: "5px"}}>
                            <IonButton onClick={clearFilters}>Clear Filters</IonButton>
                        </IonItem>)}
                </IonRow>
                {songs && songs.length > 0 && (
                    <IonList>
                        {filterSongs(songs, titleFilter, authorFilter, likedFilter ?? false).map(({id, title, author, releaseDate, playCount, liked}) =>
                            <Song
                                key={id}
                                id={id}
                                title={title}
                                author={author}
                                releaseDate={releaseDate}
                                playCount={playCount}
                                liked={liked}
                                onEdit={id => history.push(`/song/${id}`)}
                            />
                        )}
                    </IonList>
                )}
                {fetchingError && (
                    <div>{fetchingError.message || 'Failed to fetch songs'}</div>
                )}
                <IonInfiniteScroll threshold="100px" onIonInfinite={onScroll} disabled={disableInfiniteScroll}>
                    <IonInfiniteScrollContent loadingText="Loading more data..."></IonInfiniteScrollContent>
                </IonInfiniteScroll>
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => history.push('/song')}>
                        <IonIcon icon={add}/>
                    </IonFabButton>
                </IonFab>
            </IonContent>
        </IonPage>
    );
};

export default SongList;
