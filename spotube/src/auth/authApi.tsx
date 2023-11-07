import axios from 'axios';
import { baseUrl, config, withLogs } from '../core';

const authUrl = `http://${baseUrl}/api/auth/`;

export interface AuthProps {
  token: string;
}

export const login: (username?: string, password?: string) => Promise<AuthProps> = (username, password) => {
  console.log("LOGIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIN", username, password);
  return withLogs(axios.post(authUrl + "login", { username, password }, config), 'login');
}

const signUpUrl = `http://${baseUrl}/api/auth/signup`;

export const signUp: (username?: string, password?: string) => Promise<AuthProps> = (username, password) => {
  console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", username, password);
  return withLogs(axios.post(authUrl + "signup", { username, password }, config), 'signup');
}

const logoutUrl = `http://${baseUrl}/api/auth/logout`;

export const logout: (username?: string, password?: string) => Promise<AuthProps> = (username, password) => {
  return withLogs(axios.post(authUrl, { username, password }, config), 'logout');
}