// import React, {useEffect, useState} from "react";
// import {GoogleMap, LoadScript, Marker} from "@react-google-maps/api";
//
// export const mapsApiKey = 'AIzaSyB4GXqiAIHWlYpZz0sr4I4wkNMYObeam-M';
//
// interface MyMapProps{
//     lat: number;
//     lng: number;
//     onMapClick: (e: any) => void,
//     onMarkerClick: (e: any) => void
// }
//
// const MyMap: React.FC<MyMapProps> = (props) => {
//     const [isLoaded, setIsLoaded] = useState(false);
//
//     useEffect(() => {
//         setIsLoaded(true);
//     }, []);
//
//     return (
//         <div style={{ height: "400px", width: "100%" }}>
//             {isLoaded && (
//                 <LoadScript googleMapsApiKey={mapsApiKey}>
//                     <GoogleMap
//                         mapContainerStyle={{ height: "100%", width: "100%" }}
//                         center={{ lat: props.lat || 0, lng: props.lng || 0 }}
//                         zoom={8}
//                         onClick={props.onMapClick}
//                     >
//                         <Marker
//                             position={{ lat: props.lat || 0, lng: props.lng || 0 }}
//                             onClick={props.onMarkerClick}
//                         />
//                     </GoogleMap>
//                 </LoadScript>
//             )}
//         </div>
//     );
// };
//
// export default MyMap;
//


import { GoogleMap } from '@capacitor/google-maps';
import {useEffect, useRef, useState} from 'react';
import {IonButton} from "@ionic/react";

export const mapsApiKey = 'AIzaSyB4GXqiAIHWlYpZz0sr4I4wkNMYObeam-M';

interface MyMapProps {
    lat: number;
    lng: number;
    onMapClick: (e: any) => void,
    onMarkerClick: (e: any) => void,
}

const MyMap: React.FC<MyMapProps> = ({ lat, lng, onMapClick, onMarkerClick }) => {
    const mapRef = useRef<HTMLElement>(null);
    const [buttonText, setButtonText] = useState("Open Map");
    const [viewMap, setViewMap] = useState(false);
    let myLocationMarkerId: string;
    useEffect(myMapEffect, [mapRef.current])

    return (
        <div className="component-wrapper">
            <IonButton
                onClick={async () => {
                    if(buttonText === "Close Map"){
                        setViewMap(false);
                        setButtonText("Open Map");
                        return;
                    }
                    setViewMap(true);
                    setButtonText("Close Map");
                }
            }
            >
                {buttonText}
            </IonButton>
            {viewMap && (
                <capacitor-google-map ref={mapRef} style={{
                    display: 'block',
                    width: 300,
                    height: 400
                }}></capacitor-google-map>
            )}
        </div>
    );

    function myMapEffect() {
        let canceled = false;
        let googleMap: GoogleMap | null = null;
        createMap();
        return () => {
            canceled = true;
            googleMap?.removeAllMapListeners();
        }

        async function addMarker({latitude, longitude} : {latitude: number, longitude: number}) {
            if(!googleMap) return;

            const coords = {lat: latitude, lng: longitude};
            googleMap.removeMarker(myLocationMarkerId);
            myLocationMarkerId = await googleMap.addMarker({ coordinate: coords, title: 'My location' });
        }

        async function createMap() {
            if (!mapRef.current) {
                return;
            }
            googleMap = await GoogleMap.create({
                id: 'my-cool-map',
                element: mapRef.current,
                apiKey: mapsApiKey,
                config: {
                    center: { lat, lng },
                    zoom: 8
                }
            })
            console.log('gm created');
            myLocationMarkerId = await googleMap.addMarker({ coordinate: { lat, lng }, title: 'My location' });
            await googleMap.setOnMapClickListener(({ latitude, longitude }) => {
                onMapClick({ latitude, longitude });
            });
            await googleMap.setOnMarkerClickListener(({ markerId, latitude, longitude }) => {
                onMarkerClick({ markerId, latitude, longitude });
            });
        }
    }
}

export default MyMap;

