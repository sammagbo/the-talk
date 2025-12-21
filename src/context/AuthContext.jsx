/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const signInWithGoogle = () => {
        return signInWithPopup(auth, googleProvider);
    };

    const logout = () => {
        return signOut(auth);
    };

    useEffect(() => {
        try {
            if (!auth) {
                console.error("Auth is not initialized");
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setLoading(false);
                return;
            }
            const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
                setUser(currentUser);
                setLoading(false);
            }, (error) => {
                // Handle auth state errors gracefully (prevents iOS Safari blocking)
                console.warn('Auth state change error:', error);
                setLoading(false);
            });

            return unsubscribe;
        } catch (error) {
            console.warn('Firebase auth setup failed:', error);
            setLoading(false);
        }
    }, []);

    const value = {
        user,
        signInWithGoogle,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
