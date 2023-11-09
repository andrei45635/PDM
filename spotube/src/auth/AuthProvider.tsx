import React, {useCallback, useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {getLogger} from '../core';
import {login as loginApi, signUp as signUpApi, logout as logoutApi} from './authApi';
import {Preferences} from "@capacitor/preferences";

const log = getLogger('AuthProvider');

type LoginFn = (username?: string, password?: string) => void;
type SignUpFn = (username?: string, password?: string) => void;
type LogoutFn = () => void;

export interface AuthState {
    authenticationError: Error | null;
    isAuthenticated: boolean;
    isAuthenticating: boolean;
    login?: LoginFn;
    signUp?: SignUpFn;
    logout?: LogoutFn;
    pendingAuthentication?: boolean;
    pendingSignUp?: boolean;
    username?: string;
    password?: string;
    token: string;
}

const initialState: AuthState = {
    isAuthenticated: false,
    isAuthenticating: false,
    authenticationError: null,
    pendingAuthentication: false,
    pendingSignUp: false,
    token: '',
};

export const AuthContext = React.createContext<AuthState>(initialState);

interface AuthProviderProps {
    children: PropTypes.ReactNodeLike,
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
    const [state, setState] = useState<AuthState>(initialState);
    const {isAuthenticated, isAuthenticating, authenticationError, pendingAuthentication, pendingSignUp, token} = state;
    const login = useCallback<LoginFn>(loginCallback, []);
    const signUp = useCallback<SignUpFn>(signUpCallback, []);
    const logout = useCallback<LogoutFn>(logoutCallback, []);
    useEffect(authenticationEffect, [pendingAuthentication, pendingSignUp]);
    const value = {isAuthenticated, login, signUp, logout, isAuthenticating, pendingSignUp, authenticationError, token};
    log('render');
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );

    function loginCallback(username?: string, password?: string): void {
        log('login');
        setState({
            ...state,
            pendingAuthentication: true,
            pendingSignUp: false,
            username,
            password
        });
    }

    function signUpCallback(username?: string, password?: string): void {
        log('signUp - testing', username, password);
        setState({
            ...state,
            pendingAuthentication: false,
            pendingSignUp: true,
            username,
            password
        });
        log('adasdasdadasdasdadadadadada', state);
    }

    function logoutCallback(): void {
        log('logout');
        Preferences.remove({key: "user"});
        localStorage.removeItem("token");
        setState({
            ...initialState
        });
    }

    function authenticationEffect() {
        let canceled = false;
        authenticate().then(r => console.log(r));
        return () => {
            canceled = true;
        }

        async function authenticate() {
            if (!pendingAuthentication && !pendingSignUp) {
                log('authenticate, !pendingAuthentication && !pendingSignUp, return');
                return;
            }
            try {
                log('authenticate...');
                setState({
                    ...state,
                    isAuthenticating: true,
                });
                // const username = usernameRef.current;
                // const password = passwordRef.current;
                const {username, password} = state;
                console.log("CACACAACACACACACACACA", username, password);
                let auth;
                if (pendingSignUp) {
                    auth = await signUpApi(username, password);
                } else {
                    auth = await loginApi(username, password);
                }
                const {token} = auth
                if (canceled) {
                    return;
                }
                localStorage.setItem("token", token);
                log('authenticate succeeded');
                setState({
                    ...state,
                    token,
                    pendingAuthentication: false,
                    pendingSignUp: false,
                    isAuthenticated: true,
                    isAuthenticating: false,
                });
            } catch (error) {
                if (canceled) {
                    return;
                }
                log('authenticate failed');
                setState({
                    ...state,
                    authenticationError: error as Error,
                    pendingAuthentication: false,
                    pendingSignUp: false,
                    isAuthenticating: false,
                });
            }
        }
    }
};
