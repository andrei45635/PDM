import {Camera, CameraPhoto, CameraResultType, CameraSource} from "@capacitor/camera";
import {useCamera} from "@capacitor-community/react-hooks/camera";
import {useStorage} from "@ionic/react-hooks/storage";
import {useEffect, useState} from "react";
import {base64FromPath, useFilesystem} from "@ionic/react-hooks/filesystem";
import {Directory, Filesystem, FilesystemDirectory} from "@capacitor/filesystem";
import {usePreferences} from "./usePreferences";

export interface Photo {
    filepath: string;
    webviewPath?: string;
}

const PHOTO_STORAGE = 'userPhotos';

export function usePhotoGallery() {
    const {getPhoto} = useCamera();
    const [photos, setPhotos] = useState<Photo[]>([]);
    //const {get, set} = useStorage();
    const {get, set} = usePreferences();
    const {deleteFile, readFile, writeFile} = useFilesystem();

    const takePhotoBase64 = async (id: string) => {
        const base64Photo = await getPhoto({
            resultType: CameraResultType.Base64,
            source: CameraSource.Camera,
            quality: 100
        });

        const base64Data = base64Photo.base64String ?? "";

        await Filesystem.writeFile({
            path: "photo_" + id + ".png",
            data: base64Data,
            directory: Directory.Data
        });
        // console.log("base64Data", availableFeatures);
        const res = await set("photo_" + id, base64Data);
        console.log("Set result:", res);

        return base64Data;
    };

    const takePhoto = async (filename: string) => {
        const photo = await getPhoto({
           resultType: CameraResultType.Uri,
           source: CameraSource.Camera,
           quality: 100
        });

        const filePath = filename + '.jpg';

        const existingPhoto = photos.find(p => p.filepath.split(".")[0] === filename);
        const path = existingPhoto?.filepath.substr(existingPhoto.filepath.lastIndexOf('/') + 1);
        path && await Filesystem.deleteFile({
            path,
            directory: Directory.Data
        });

        const savedFileImage = await savePicture(photo, filePath);

        const rest = photos.filter(p => !p.filepath.includes(filename));
        const newPhotos = [savedFileImage, ...rest];
        // @ts-ignore
        setPhotos(newPhotos);
        await set(PHOTO_STORAGE, JSON.stringify(newPhotos));
    };

    const savePicture = async (photo: CameraPhoto, filePath: string) => {
        const base64Data = base64FromPath(photo.webPath ?? "");
        await writeFile({
            path: filePath,
            data: base64Data,
            directory: Directory.Documents
        });

        return {
            filepath: filePath,
            webviewPath: photo.webPath
        }
    };

    useEffect(() => {
        const loadSaved = async () => {
            const photoStr = await get(PHOTO_STORAGE);
            const photos = (photoStr ? JSON.parse(photoStr) : []) as Photo[];
            for(let photo of photos){
                const file = await readFile({
                    path: photo.filepath,
                    directory: FilesystemDirectory.Data
                });
                photo.webviewPath = `data:image/jpeg;base64,${file}`;
            }
            setPhotos(photos);
        }
        loadSaved().then(r => console.log(r));
    }, [get, readFile]);

    const deletePhoto = async (photo: Photo) => {
        const newPhotos = photos.filter(p => p.filepath !== photo.filepath);
        await set(PHOTO_STORAGE, JSON.stringify(newPhotos));
        const filename = photo.filepath.substr(photo.filepath.lastIndexOf('/') + 1);
        await deleteFile({
           path: filename,
           directory: FilesystemDirectory.Data
        });
        setPhotos(newPhotos);
    }

    return {
        photos,
        takePhoto,
        takePhotoBase64,
        deletePhoto
    };
}