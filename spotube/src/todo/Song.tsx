import React, {memo, useEffect, useState} from 'react';
import {IonButton, IonImg, IonItem, IonLabel} from '@ionic/react';
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

const Song: React.FC<SongPropsExt> = ({ id, title, author, releaseDate, playCount, liked, latitude, longitude, onEdit }) => {
    const [mapVisible, setMapVisible] = useState(false);
    const [photos, setPhotos] = useState<MyPhoto[]>([]);
    //const {photos} = usePhotos();
    const{readFile} = useFilesystem();
    const {get} = usePreferences();
    function loadPhotos() {
        loadSavedPhotos();

        async function loadSavedPhotos(){
            const savedPhotoStr = await get("photos" + id);
            await get("photos" + id).then(value => {
                if(value != null){
                    // @ts-ignore
                    localStorage.setItem("photo", JSON.parse(value).map(item => {
                        const startIndex = item.webviewPath.indexOf("base64,") + "base64,".length;
                        return item.webviewPath.substring(startIndex);
                    }));
                }
            });
            console.log("savedPhotoStr", await get("photos" + id));
            const savedPhotos = (savedPhotoStr ? JSON.parse(savedPhotoStr) : []) as MyPhoto[];
            //localStorage.setItem("photo", await get("photos" + id)!.);
            console.log('load photos', savedPhotos);
            for(let photo of savedPhotos){
                const data = await readFile(photo.filepath);
                photo.webviewPath = `data:image/jpeg;base64,${data}`;
            }
            setPhotos(savedPhotos);
        }
    }
    useEffect(() => {
        loadPhotos(); // Load photos when the component mounts
    }, [get, readFile, setPhotos]);

    const handleMapClick = () => {
        log('map'); // Logging the map event, you can replace this with your logic
        onEdit(id);
        setMapVisible(true);
    };
    return (
        <>
            {/*onClick={() => onEdit(id)}*/}
        <IonItem className="song" >
        <IonLabel>
            {photos.length > 0 && (
                <IonImg
                    src={photos[0]?.webviewPath || ""}
                    style={{
                        width: "150px",
                        height: "150px",
                        objectFit: "cover",
                        marginRight: "10px",
                    }}
                />
            )}
            <div onClick={() => onEdit(id)}>
                <h2>{title}</h2>
                <p>{`Author: ${author}`}</p>
                <p>{`Release Date: ${releaseDate}`}</p>
                <p>{`Play Count: ${playCount}`}</p>
                <p>{`Liked: ${liked ? 'True' : 'False'}`}</p>
            </div>
        </IonLabel>
            <IonButton onClick={handleMapClick}>View Map</IonButton>
            { mapVisible &&
                <div style={{ height: '400px', width: '100%' }}>
                    <MyMap lat={latitude ?? 0} lng={longitude ?? 0} onMapClick={handleMapClick} onMarkerClick={handleMapClick} />
                </div>
            }
            <MyModal base64Data={localStorage.getItem("photo")! || "undefined"}/>
        </IonItem>
        </>
    );
};

export default memo(Song);
