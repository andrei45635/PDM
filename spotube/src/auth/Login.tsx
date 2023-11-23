import React, {useCallback, useContext, useEffect, useState} from 'react';
import {RouteComponentProps} from 'react-router';
import {IonButton, IonContent, IonHeader, IonInput, IonLoading, IonPage, IonTitle, IonToolbar} from '@ionic/react';
import {AuthContext} from './AuthProvider';
import {getLogger} from '../core';
import {Redirect} from "react-router-dom";
import {MyModal} from "../components/MyModal";

const log = getLogger('Login');

interface LoginState {
    username?: string;
    password?: string;
}

export const Login: React.FC<RouteComponentProps> = ({history}) => {
    const {isAuthenticated, isAuthenticating, login, signUp, authenticationError} = useContext(AuthContext);
    const [state, setState] = useState<LoginState>({});
    const {username, password} = state;
    const handlePasswordChange = useCallback((e: any) => {
        log('Password changed:', e.detail.value);
        setState({
            ...state,
            password: e.detail.value || '',
        })
    }, [state]);
    log("RANDOM STATE", state);
    const handleUsernameChange = useCallback((e: any) => setState({
        ...state,
        username: e.detail.value || ''
    }), [state]);
    const handleLogin = useCallback(() => {
        log('handleLogin...');
        login?.(username, password);
    }, [username, password]);
    const handleSignUp = useCallback(() => {
        log("handleSignUp...", username, password, state);
        signUp?.(username, password);
    }, [username, password]);
    log('render');
    useEffect(() => {
        if (isAuthenticated) {
            log('redirecting to home');
            history.push('/');
        }
    }, [isAuthenticated]);
    if (isAuthenticated) {
        return <Redirect to={{ pathname: '/' }} />
    }
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Login</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonInput
                    placeholder="Username"
                    value={username}
                    onIonChange={handleUsernameChange}/>
                <IonInput
                    placeholder="Password"
                    value={password}
                    onIonChange={handlePasswordChange}/>
                <IonLoading isOpen={isAuthenticating}/>
                {authenticationError && (
                    <div>{authenticationError.message || 'Failed to authenticate'}</div>
                )}
                <IonButton onClick={handleLogin}>Login</IonButton>
                <IonButton onClick={handleSignUp}>Sign Up</IonButton>
            </IonContent>
        </IonPage>
    );
};
