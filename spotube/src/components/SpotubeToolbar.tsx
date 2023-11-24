import {CreateAnimation, IonButton, IonTitle, IonToolbar} from '@ionic/react';
import React, {useContext, useEffect, useRef} from 'react';
import {useNetwork} from "../hooks/useNetwork";
import {usePreferences} from "../hooks/usePreferences";
import {useAppState} from "../hooks/useAppState";
import {AuthContext} from "../auth";
import {MyModal} from "./MyModal";

const SpotubeToolbar: React.FC = () => {
    const {logout} = useContext(AuthContext);
    const {appState} = useAppState();
    const {networkStatus} = useNetwork();
    const animationRef = useRef<CreateAnimation>(null);
    usePreferences();
    console.log('App state:', appState);
    console.log('Network status:', networkStatus);

    useEffect(() => {
        if (animationRef.current) {
            animationRef.current.animation.play();
        }
    }, [animationRef]);

    const styles = {
        container: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
        },
        info: {
            backgroundColor: '#fff',
            borderRadius: '10px',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
            padding: '20px',
            textAlign: 'center',
        },
        appState: {
            fontSize: '1.2em',
            marginBottom: '10px',
            color: '#3498db',
        },
        networkStatus: {
            fontSize: '1.1em',
            marginBottom: '15px',
            color: '#27ae60',
        },
        logoutButton: {
            backgroundColor: '#e74c3c',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            padding: '10px 20px',
            fontSize: '1em',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
        },
    };

    return (
        <IonToolbar>
            <div>
                <CreateAnimation
                    ref={animationRef}
                    duration={1000}
                    keyframes={[
                        // { offset: 0, transform: 'scale(1)', opacity: '1' },
                        // { offset: 0.5, transform: 'scale(1.2)', opacity: '0.8' },
                        // { offset: 1, transform: 'scale(1)', opacity: '1' },
                        { offset: 0, color: '#ff0000' },   // Red
                        { offset: 0.16, color: '#ff9900' }, // Orange
                        { offset: 0.33, color: '#ffff00' }, // Yellow
                        { offset: 0.5, color: '#00ff00' },  // Green
                        { offset: 0.66, color: '#0000ff' }, // Blue
                        { offset: 0.83, color: '#4b0082' }, // Indigo
                        { offset: 1, color: '#9400d3' },    // Violet
                    ]}
                    iterations={Infinity}
                    easing="ease-in-out"
                >
                    <h1 style={{ display: 'inline-block' , paddingLeft: '10px'}}>Spotube</h1>
                </CreateAnimation>
                <div>
                    <div style={styles.appState}>App state is {appState.isActive.toString()}</div>
                    <div style={styles.networkStatus}>Network status is {networkStatus.connected ? 'true' : 'false'} and the connection type is {networkStatus.connectionType.toString()}</div>
                    {/*<MyModal/>*/}
                    <IonButton style={styles.logoutButton} expand="block" onClick={logout}>Logout</IonButton>
                </div>
            </div>
        </IonToolbar>
    );
};

export default SpotubeToolbar;
