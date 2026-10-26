import { createContext, useContext, useMemo, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
const STORAGE_KEY = 'rayn-stream-session';
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

function readSession() {
  const storedSession = localStorage.getItem(STORAGE_KEY);
  if (!storedSession) return { user: null, token: null };

  try {
    const session = JSON.parse(storedSession);
    if (typeof session.token === 'string' && session.user && typeof session.user === 'object') {
      return { user: session.user, token: session.token };
    }
  } catch (error) {
    console.warn('Unable to restore the saved RAYN STREAM session.', error);
  }

  localStorage.removeItem(STORAGE_KEY);
  return { user: null, token: null };
}

export const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = readSession().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function getApiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  return error.response?.data?.message || error.message || fallback;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);

  async function authenticate(endpoint, credentials) {
    const { data } = await api.post(`/auth/${endpoint}`, credentials);
    if (typeof data.token !== 'string' || !data.user || typeof data.user !== 'object') {
      throw new Error('The server returned an invalid authentication response.');
    }

    const newSession = { token: data.token, user: data.user };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
    setSession(newSession);
    return data.user;
  }

  function login(credentials) {
    return authenticate('login', credentials);
  }

  function signup(credentials) {
    return authenticate('signup', credentials);
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setSession({ user: null, token: null });
  }

  const value = useMemo(
    () => ({ ...session, login, signup, logout }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider.');
  return context;
}
