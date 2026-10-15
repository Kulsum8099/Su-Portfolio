import { createContext, useContext } from 'react';

export const AuthContext = createContext(null);
export const ToastContext = createContext(() => {});

/** { status: 'loading' | 'authenticated' | 'anonymous' | 'error', admin, expired, login, logout } */
export const useAuth = () => useContext(AuthContext);

/** notify(message, { tone: 'success' | 'error' | 'info' }) */
export const useToast = () => useContext(ToastContext);
