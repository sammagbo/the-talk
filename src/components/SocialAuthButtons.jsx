import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

/**
 * Social Authentication Buttons Component
 * Renders branded sign-in buttons for Google, Apple, and Twitter
 */
export default function SocialAuthButtons({ onSuccess, onError, className = '' }) {
    const { signInWithGoogle, signInWithApple, signInWithTwitter } = useAuth();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(null);

    const handleSignIn = async (provider, signInFn) => {
        setLoading(provider);
        try {
            await signInFn();
            onSuccess?.();
        } catch (error) {
            console.error(`${provider} sign-in failed:`, error);
            onError?.(error);
        } finally {
            setLoading(null);
        }
    };

    const buttonBaseStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        width: '100%',
        padding: '12px 20px',
        borderRadius: '12px',
        fontSize: '15px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        border: 'none',
        marginBottom: '12px',
    };

    const providers = [
        {
            name: 'google',
            label: t('auth.continueWithGoogle', 'Continue with Google'),
            signInFn: signInWithGoogle,
            style: {
                ...buttonBaseStyle,
                backgroundColor: '#ffffff',
                color: '#1f1f1f',
                boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
            },
            hoverStyle: {
                backgroundColor: '#f5f5f5',
                boxShadow: '0 3px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)',
            },
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
            ),
        },
        {
            name: 'twitter',
            label: t('auth.continueWithTwitter', 'Continue with X'),
            signInFn: signInWithTwitter,
            style: {
                ...buttonBaseStyle,
                backgroundColor: '#000000',
                color: '#ffffff',
            },
            hoverStyle: {
                backgroundColor: '#1a1a1a',
            },
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            ),
        },
    ];

    return (
        <div className={className}>
            {providers.map(({ name, label, signInFn, style, hoverStyle, icon }) => (
                <button
                    key={name}
                    onClick={() => handleSignIn(name, signInFn)}
                    disabled={loading !== null}
                    style={style}
                    onMouseEnter={(e) => {
                        Object.assign(e.target.style, hoverStyle);
                    }}
                    onMouseLeave={(e) => {
                        Object.assign(e.target.style, style);
                    }}
                    aria-label={label}
                >
                    {loading === name ? (
                        <span style={{
                            width: '20px',
                            height: '20px',
                            border: '2px solid currentColor',
                            borderTopColor: 'transparent',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite'
                        }} />
                    ) : (
                        icon
                    )}
                    <span>{label}</span>
                </button>
            ))}
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
