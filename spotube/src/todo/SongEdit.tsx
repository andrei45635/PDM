import React, {useCallback, useContext, useEffect, useState} from 'react';
import {
    IonActionSheet,
    IonButton,
    IonButtons,
    IonCheckbox, IonCol,
    IonContent, IonFabButton, IonGrid,
    IonHeader, IonIcon, IonImg,
    IonInput,
    IonLoading,
    IonPage, IonRow,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import {getLogger} from '../core';
import {SongContext} from './SongProvider';
import {RouteComponentProps} from 'react-router';
import {SongProps} from './SongProps';
import moment from 'moment';
import {useMyLocation} from "../hooks/useMyLocation";
import MyMap from "../components/MapModal";

import {MyPhoto, usePhotos} from "../hooks/usePhotos";
import {camera, save, trash, trashBin, unlink} from "ionicons/icons";

const log = getLogger('SongEdit');

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
    const [latitude, setLatitude] = useState(0);
    const [longitude, setLongitude] = useState(0);
    const [photoBase64, setPhotoBase64] = useState("");
    const {photos, takePhoto, deletePhoto} = usePhotos(match.params.id || "");
    const [photoAction, setPhotoAction] = useState<MyPhoto | undefined>(undefined);
    const [song, setSong] = useState<SongProps | undefined>(undefined);
    const [mapVisible, setMapVisible] = useState(false);
    const [showActionSheet, setShowActionSheet] = useState(false);
    const myLocation = useMyLocation();

    useEffect(() => {
        console.log("photoBase64 in useEffect:", photoBase64);
    }, [photoBase64]);

    useEffect(() => {
        log('useEffect');
        const routeId = match.params.id || '';
        const song = songs?.find(sg => parseInt(sg.id!) === parseInt(routeId));
        setSong(song);
        if (song) {
            setTitle(song.title);
            setAuthor(song.author);
            setReleaseDate(song.releaseDate);
            setPlayCount(song.playCount);
            setLiked(song.liked);
            setLatitude(song.latitude);
            setLongitude(song.longitude);
            setPhotoBase64(song.photoBase64);
        }
        console.log("SONG IN EDIT", song);
    }, [match.params.id, songs]);

    const handleSave = useCallback(() => {
        const editedSong = song ? {...song, title, author, releaseDate, playCount, liked, latitude, longitude, photoBase64} : {
            title,
            author,
            releaseDate,
            playCount,
            liked,
            latitude,
            longitude,
            photoBase64
        };
        saveSong && saveSong(editedSong).then(() => history.goBack());
    }, [song, saveSong, title, author, releaseDate, playCount, liked, latitude, longitude, photoBase64, history]);
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
                <label className="input-label">Title</label>
                <IonInput value={title} onIonChange={e => setTitle(e.detail.value || '')} class="input"/>

                <label className="input-label">Author</label>
                <IonInput value={author} onIonChange={e => setAuthor(e.detail.value || '')} class="input"/>

                <label className="input-label">Release Date</label>
                <IonInput
                    class="input"
                    value={releaseDate ? moment(releaseDate).format('MM-DD-YYYY') : ''}
                    onIonChange={(e) => {
                        if (e.detail.value) {
                            const inputDate = new Date(moment(e.detail.value, "MM-DD-YYYY").toLocaleString());
                            setReleaseDate(inputDate);
                        } else {
                            setReleaseDate(undefined);
                        }
                    }}
                />

                <label className="input-label">Play Count</label>
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
                    class="input"
                />

                <div className="checkbox-label">
                    <span>  Liked  </span>
                    <IonCheckbox checked={liked} onIonChange={e => setLiked(e.detail.checked)}/>
                </div>

                {(
                    <MyMap lat={latitude} lng={longitude} onMapClick={({latitude, longitude}) => {
                        setLatitude(latitude);
                        setLongitude(longitude);
                    }} onMarkerClick={() => log("Map click")}
                    />
                )}
                <IonButton onClick={() => setShowActionSheet(true)} expand="block">
                    Show Action Sheet
                </IonButton>
                    <>
                        <IonFabButton onClick={() => takePhoto()}>
                            <IonIcon icon={camera}></IonIcon>
                        </IonFabButton>
                        <IonGrid>
                            <IonRow>
                                {photos.map((photo, index) => (
                                    <IonCol size="3" key={index}>
                                        <IonImg
                                            onClick={() => {
                                                setPhotoAction(photo);
                                                console.log('taken photo', photo);
                                            }}
                                            src={photo.webviewPath}
                                        />
                                    </IonCol>
                                ))}
                            </IonRow>
                        </IonGrid>
                        <IonActionSheet
                            isOpen={showActionSheet}
                            onDidDismiss={() => setShowActionSheet(false)}
                            buttons={[
                                {
                                    // @ts-ignore
                                    text: "Save",
                                    icon: save,
                                    role: "save",
                                    handler: () => {
                                        if(photoAction){
                                            console.log('photoAction!!!!!!!', photoAction);
                                            const link = document.createElement("a");
                                            link.href = photoAction?.webviewPath ?? "";
                                            link.download = "image.png";
                                            document.body.appendChild(link);
                                            link.click();
                                            console.log("PHOTO BASE 64444444", photoAction?.webviewPath);

                                            localStorage.setItem("photo", photoAction?.webviewPath!);
                                            setPhotoBase64(photoAction?.webviewPath!.split(",")[1]);
                                            console.log('setPhotoBase64', photoBase64);
                                            document.removeChild(link);
                                            setPhotoAction(undefined);
                                        }
                                    }
                                },
                                {
                                    text: 'Delete',
                                    role: 'destructive',
                                    icon: trash,
                                    handler: () => {
                                        if (photoAction) {
                                            deletePhoto(photoAction);
                                            setPhotoAction(undefined);
                                        }
                                    }
                                },
                                {
                                    text: "Cancel",
                                    icon: unlink,
                                    role: "cancel"
                                }
                            ]}
                        />
                    </>
                {mapVisible &&
                    <MyMap
                        lat={song?.latitude ?? 0}
                        lng={song?.longitude ?? 0}
                        onMapClick={
                            (e: any) => {
                                console.log(song);
                                console.log("LATITUDE!!!", e.latLng.lat());
                                console.log("LONGITUDE!!!", e.latLng.lng());
                                setLongitude(e.latLng.lat());
                                setLatitude(e.latLng.lng());
                                setMapVisible(true)
                            }
                        }
                        // @ts-ignore
                        onMarkerClick={log('marker')}
                    />
                }

                <IonLoading isOpen={saving}/>
                {savingError && (
                    <div className="error-message">{savingError.message || 'Failed to save song'}</div>
                )}
            </IonContent>
        </IonPage>
    );
};

export default SongEdit;
