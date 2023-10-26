import React, {useCallback, useContext, useEffect, useState} from 'react';
import {
    IonButton,
    IonButtons, IonCheckbox,
    IonContent,
    IonHeader,
    IonInput,
    IonLoading,
    IonPage,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import {getLogger} from '../core';
import {SongContext} from './SongProvider';
import {RouteComponentProps} from 'react-router';
import {SongProps} from './SongProps';
import moment from 'moment';

const log = getLogger('SongEdit');
const baseUrl = 'localhost:3000';
const songUrl = `http://${baseUrl}/song`;

interface SongEditProps extends RouteComponentProps<{
    id?: string;
}> {
}

const SongEdit: React.FC<SongEditProps> = ({history, match}) => {
    const {songs, saving, savingError, saveSong} = useContext(SongContext);
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [releaseDate, setReleaseDate] = useState<Date | undefined>(undefined);
    const [playCount, setPlayCount] = useState(0);
    const [liked, setLiked] = useState(false);
    const [song, setSong] = useState<SongProps | undefined>(undefined);

    useEffect(() => {
        log('useEffect');
        const routeId = match.params.id || '';
        const song = songs?.find(sg => parseInt(sg.id!) === parseInt(routeId)); //nu stiu ce se intampla aici, dar merge
        for(let i = 0; i < songs?.length!; i++){
            console.log(songs?.at(i), songs?.at(i)!.id, parseInt(routeId), parseInt(songs?.at(i)!.id!) === parseInt(routeId));
        }
        setSong(song);
        if (song) {
            setTitle(song.title);
            setAuthor(song.author);
            setReleaseDate(song.releaseDate);
            setPlayCount(song.playCount);
            setLiked(song.liked);
        }
    }, [match.params.id, songs]);

    const handleSave = useCallback(() => {
        const editedSong = song ? {...song, title, author, releaseDate, playCount, liked} : {
            title,
            author,
            releaseDate,
            playCount,
            liked
        };
        saveSong && saveSong(editedSong).then(() => history.goBack());
    }, [song, saveSong, title, author, releaseDate, playCount, liked, history]);
    log('render');
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Edit</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={handleSave}>
                            Save
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonInput value={title} onIonChange={e => setTitle(e.detail.value || '')}/>
                <IonInput value={author} onIonChange={e => setAuthor(e.detail.value || '')}/>
                <IonInput
                    class="input"
                    value={releaseDate ? moment(releaseDate).format('DD-MM-YYYY') : ''}
                    onIonChange={(e) => {
                        if (e.detail.value) {
                            const inputDate = new Date(moment(e.detail.value, "DD-MM-YYYY").toISOString());
                            setReleaseDate(inputDate);
                        } else {
                            setReleaseDate(undefined);
                        }
                    }}
                />
                <IonInput
                    type="number"
                    value={playCount.toString()}
                    onIonChange={e => {
                        const inputVal: string = e.detail.value!;
                        const parsedCount = parseInt(inputVal, 10);
                        if (!isNaN(parsedCount)) {
                            setPlayCount(parsedCount);
                        }
                    }}
                />
                <IonCheckbox checked={liked} onIonChange={e => setLiked(e.detail.checked)}/>
                <IonLoading isOpen={saving}/>
                {savingError && (
                    <div>{savingError.message || 'Failed to save song'}</div>
                )}
            </IonContent>
        </IonPage>
    );
};

export default SongEdit;



