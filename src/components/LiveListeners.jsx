import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * LiveListeners Component
 * 
 * Displays the count of active listeners for an episode with a pulsing indicator.
 * 
 * @param {number} count - Number of active listeners
 * @param {boolean} isConnected - Whether real-time connection is active
 */
export default function LiveListeners({ count = 0, isConnected = false }) {
    const { t } = useTranslation();

    if (count === 0) return null;

    return (
        <div
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: '20px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                fontSize: '13px',
                fontWeight: '500',
            }}
            aria-label={t('player.liveListeners', { count })}
        >
            {/* Pulsing indicator */}
            <span
                style={{
                    position: 'relative',
                    width: '8px',
                    height: '8px',
                }}
            >
                <span
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: '#ef4444',
                        borderRadius: '50%',
                        animation: isConnected ? 'pulse 2s ease-in-out infinite' : 'none',
                    }}
                />
                <span
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: '#ef4444',
                        borderRadius: '50%',
                        opacity: 0.75,
                        animation: isConnected ? 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' : 'none',
                    }}
                />
            </span>

            {/* Listener count */}
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                {count.toLocaleString()}
            </span>

            {/* Label */}
            <span style={{ color: 'rgba(239, 68, 68, 0.8)' }}>
                {count === 1
                    ? t('player.listener', 'listening')
                    : t('player.listeners', 'listening')
                }
            </span>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                @keyframes ping {
                    75%, 100% {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    );
}
