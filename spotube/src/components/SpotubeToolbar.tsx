import {IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar} from '@ionic/react';
import React, {useCallback, useContext, useEffect} from 'react';
import {useNetwork} from "../network/useNetwork";
import {usePreferences} from "../network/usePreferences";
import {useAppState} from "../network/useAppState";
import {AuthContext} from "../auth";

const SpotubeToolbar: React.FC = () => {
    const {logout} = useContext(AuthContext);
    const {appState} = useAppState();
    const {networkStatus} = useNetwork();
    usePreferences();
    console.log('App state:', appState);
    console.log('Network status:', networkStatus);
    return (
        // <IonPage>
        //     <IonHeader>
        //         <IonToolbar>
        //             <IonTitle>Spotube</IonTitle>
        //         </IonToolbar>
        //     </IonHeader>
        //     <IonContent fullscreen>
        //         <div>App state is {JSON.stringify(appState)}</div>
        //         <div>Network status is {JSON.stringify(networkStatus)}</div>
        //         <IonButton expand="block" onClick={logout}>Logout</IonButton>
        //     </IonContent>
        // </IonPage>
        <IonToolbar>
            <div>
                <IonTitle>Spotube</IonTitle>
                <div>
                    <div>App state is {JSON.stringify(appState)}</div>
                    <div>Network status is {JSON.stringify(networkStatus)}</div>
                    <IonButton expand="block" onClick={logout}>Logout</IonButton>
                </div>
            </div>
        </IonToolbar>
    );
};

export default SpotubeToolbar;
