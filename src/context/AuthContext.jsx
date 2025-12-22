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

    const signInWithGoogle = async () => {
        if (!auth || !googleProvider) {
            console.warn('Firebase auth not available');
            return null;
        }
        return signInWithPopup(auth, googleProvider);
    };

    const logout = async () => {
        if (!auth) {
            console.warn('Firebase auth not available');
            return null;
        }
        return signOut(auth);
    };

    useEffect(() => {
        // If Firebase auth is not available, render app without auth
        if (!auth) {
            console.warn('Firebase auth not initialized, rendering without auth');
            setLoading(false);
            return;
        }

        let unsubscribe;
        try {
            unsubscribe = onAuthStateChanged(
                auth,
                (currentUser) => {
                    setUser(currentUser);
                    setLoading(false);
                },
                (error) => {
                    // Handle auth state errors gracefully (prevents iOS Safari blocking)
                    console.warn('Auth state change error:', error);
                    setLoading(false);
                }
            );
        } catch (error) {
            console.warn('Firebase auth setup failed:', error);
            setLoading(false);
        }

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    const value = {
        user,
        signInWithGoogle,
        logout,
        loading
    };

    // Always render children, even during loading (prevents white screen)
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
