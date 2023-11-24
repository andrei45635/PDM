import {useEffect, useState} from "react";
import {useCamera} from "./useCamera";
import {useFilesystem} from "./useFilesystem";
import {usePreferences} from "./usePreferences";

export interface MyPhoto{
    filepath: string;
    webviewPath?: string;
}

const PHOTOS = 'photos';

export function usePhotos(id: string){
    const [photos, setPhotos] = useState<MyPhoto[]>([]);
    const {getPhoto} = useCamera();
    const{readFile, writeFile, deleteFile} = useFilesystem();
    const {get, set} = usePreferences();
    useEffect(loadPhotos, [get, readFile, setPhotos]);
    return {
        photos,
        takePhoto,
        deletePhoto
    };

    async function takePhoto(){
        const {base64String} = await getPhoto();
        const filepath = new Date().getTime() + '.jpeg';
        await writeFile(filepath, base64String!);
        const webviewPath = `data:image/jpeg;base64,${base64String}`;
        const newPhoto = {filepath, webviewPath};
        const newPhotos = [newPhoto, ...photos];
        await set(PHOTOS + id, JSON.stringify(newPhotos));
        setPhotos(newPhotos);
    }


    async function deletePhoto(photo: MyPhoto){
        const newPhotos = photos.filter(p => p.filepath !== photo.filepath);
        await set(PHOTOS + id, JSON.stringify(newPhotos));
        await deleteFile(photo.filepath);
        setPhotos(newPhotos);
    }

    function loadPhotos() {
        loadSavedPhotos();

        async function loadSavedPhotos(){
            const savedPhotoStr = await get(PHOTOS + id);
            const savedPhotos = (savedPhotoStr ? JSON.parse(savedPhotoStr) : []) as MyPhoto[];
            console.log('load photos', savedPhotos);
            if(savedPhotos.length > 0){
                for(let photo of savedPhotos){
                    const data = await readFile(photo.filepath);
                    photo.webviewPath = `data:image/jpeg;base64,${data}`;
                }
                setPhotos(savedPhotos);
            }
        }
    }
}