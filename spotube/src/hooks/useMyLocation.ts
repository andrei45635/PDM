import {Geolocation, Position} from "@capacitor/geolocation";
import {useEffect, useState} from "react";

export interface MyLocation{
    position?: Position | null; //GeoLocationPosition?
    error?: Error;
}

export const useMyLocation = () => {
    const [state, setState] = useState<MyLocation>({});

    async function watchMyLocation() {
        let cancelled = false;
        let callbackId: string;

        try{
            const position = await Geolocation.getCurrentPosition();
            updateMyPosition("current", position);
        } catch (error) {
            updateMyPosition('current', undefined, error);
        }

        callbackId = await Geolocation.watchPosition({}, (position, err) => {
            updateMyPosition("watch", position!, err);
        });

        return () => {
            cancelled = true;
            Geolocation.clearWatch({id: callbackId});
        }

        function updateMyPosition(source: string, position?: Position | null, error: any = undefined) {
            console.log("USE MY LOCATION!!!!!!", source, position, error);
            if(!cancelled && (position || error)){
                // setState({...state, position: position || state.position, error})
                setState({position , error});
            }
        }
    }

    useEffect(() => {
        watchMyLocation()
    }, [setState]);
    return state;
};