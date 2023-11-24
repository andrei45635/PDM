import React, {memo, useEffect, useRef, useState} from 'react';
import {CreateAnimation, IonButton, IonImg, IonItem, IonLabel} from '@ionic/react';
import { getLogger } from '../core';
import { SongProps } from './SongProps';
import MyMap from "../components/MapModal";
import {PhotoModal} from "../components/PhotoModal";
import {MyPhoto, usePhotos} from "../hooks/usePhotos";
import {usePreferences} from "../hooks/usePreferences";
import {useFilesystem} from "../hooks/useFilesystem";
import {MyModal} from "../components/MyModal";

const log = getLogger('Song');

interface SongPropsExt extends SongProps {
  onEdit: (id?: string) => void;
}

const Song: React.FC<SongPropsExt> = ({ id, title, author, releaseDate, playCount, liked, latitude, longitude, photoBase64, onEdit }) => {
    const [mapVisible, setMapVisible] = useState(false);
    const [photos, setPhotos] = useState<MyPhoto[]>([]);
    const animationRef = useRef<CreateAnimation>(null);
    //const {photos} = usePhotos();
    const{readFile} = useFilesystem();
    const {get} = usePreferences();
    function loadPhotos() {
        loadSavedPhotos();

        async function loadSavedPhotos(){
            let savedPhotoStr = await get("photos" + id);
            console.log("what am I getting here", await get("photos" + id));
            await get("photos" + id).then(value => {
                if(value != null){
                    // @ts-ignore
                    photoBase64 = JSON.parse(value).map(item => {
                        const startIndex = item.webviewPath.indexOf("base64,") + "base64,".length;
                        return item.webviewPath.substring(startIndex);
                    });
                    // @ts-ignore
                    localStorage.setItem("photo", JSON.parse(value).map(item => {
                        const startIndex = item.webviewPath.indexOf("base64,") + "base64,".length;
                        return item.webviewPath.substring(startIndex);
                    }));
                }
            });
            console.log("savedPhotoStr", photoBase64);
            const savedPhotos = (savedPhotoStr ? JSON.parse(savedPhotoStr) : []) as MyPhoto[];
            //localStorage.setItem("photo", await get("photos" + id)!.);
            console.log('load photos', savedPhotos);
            if(savedPhotos.length > 0){
                for(let photo of savedPhotos){
                    const data = await readFile(photo.filepath);
                    photo.webviewPath = `data:image/jpeg;base64,${data}`;
                    photoBase64 = data;
                }
                setPhotos(savedPhotos);
            }
            console.log('photoBase64', photoBase64);
        }
    }
    useEffect(() => {
        loadPhotos(); // Load photos when the component mounts
    }, [get, readFile, setPhotos]);

    useEffect(() => {
        if (animationRef.current) {
            animationRef.current.animation.play();
        }
    }, [animationRef]);

    const handleMapClick = () => {
        log('map'); // Logging the map event, you can replace this with your logic
        onEdit(id);
        setMapVisible(true);
    };
    return (
        <>
            <IonItem className="song">
                <div style={{ borderRadius: '10px', overflow: 'hidden' }}>
                    <IonImg
                        src={'data:image/jpeg;base64,' + photoBase64 || ''}
                        style={{
                            width: '100px', // Adjust the width as needed
                            height: '100px', // Adjust the height as needed
                            objectFit: 'cover',
                            margin: '0 10px'
                        }}
                    />
                </div>
                <IonLabel>
                    <div onClick={() => onEdit(id)}>
                        <CreateAnimation
                            ref={animationRef}
                            duration={1000}
                            keyframes={[
                                { offset: 0, opacity: '0' },
                                { offset: 0.5, opacity: '1' },
                                { offset: 1, opacity: '0' },
                            ]}
                            iterations={Infinity}
                            easing="ease-in-out"
                        >
                            <h2 style={{ display: 'inline-block', paddingLeft: '1px' }}>{title}</h2>
                        </CreateAnimation>
                        <p>{`Author: ${author}`}</p>
                        <p>{`Release Date: ${releaseDate}`}</p>
                        <p>{`Play Count: ${playCount}`}</p>
                        <p>{`Liked: ${liked ? 'True' : 'False'}`}</p>
                    </div>
                </IonLabel>
                <IonButton onClick={handleMapClick}>View Map</IonButton>
                {mapVisible && (
                    <div style={{ height: '400px', width: '100%' }}>
                        <MyMap lat={latitude ?? 0} lng={longitude ?? 0} onMapClick={handleMapClick} onMarkerClick={handleMapClick} />
                    </div>
                )}
                <MyModal base64Data={photoBase64 || 'undefined'} />
            </IonItem>
        </>
    );
};

export default memo(Song);
