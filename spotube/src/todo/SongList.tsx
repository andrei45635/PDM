import React, {useContext, useEffect, useState} from 'react';
import {RouteComponentProps} from 'react-router';
import {
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonList, IonLoading,
    IonPage,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import {add} from 'ionicons/icons';
import {getLogger} from '../core';
import {SongContext} from './SongProvider';
import Song from "./Song";

const log = getLogger('SongList');

const SongList: React.FC<RouteComponentProps> = ({history}) => {
    const {songs, fetching, fetchingError} = useContext(SongContext);
    log('render');
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Spotube</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonLoading isOpen={fetching} message="Fetching songs"/>
                {songs && songs.length > 0 && (
                    <IonList>
                        {songs.map(({id, title, author, releaseDate, playCount, liked}) =>
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
