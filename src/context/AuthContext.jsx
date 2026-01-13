/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const signInWithGoogle = async () => {
        if (!supabase) {
            console.warn('Supabase not available');
            return null;
        }

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin,
            },
        });

        if (error) {
            console.error('Google sign-in error:', error);
            throw error;
        }

        return data;
    };

    const logout = async () => {
        if (!supabase) {
            console.warn('Supabase not available');
            return null;
        }

        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Logout error:', error);
            throw error;
        }

        setUser(null);
    };

    useEffect(() => {
        if (!supabase) {
            console.warn('Supabase not initialized, rendering without auth');
            setLoading(false);
            return;
        }

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                // Map Supabase user to our user format
                setUser({
                    uid: session.user.id,
                    email: session.user.email,
                    displayName: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
                    photoURL: session.user.user_metadata?.avatar_url,
                });
            }
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (session?.user) {
                    setUser({
                        uid: session.user.id,
                        email: session.user.email,
                        displayName: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
                        photoURL: session.user.user_metadata?.avatar_url,
                    });
                } else {
                    setUser(null);
                }
                setLoading(false);
            }
        );

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    const value = {
        user,
        signInWithGoogle,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
