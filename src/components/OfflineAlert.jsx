import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export default function OfflineAlert() {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!isOffline) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-amber-500 text-black py-2 px-4 flex items-center justify-center gap-2 text-sm font-bold animate-slide-down">
            <WifiOff size={16} />
            <span>Vous êtes hors ligne. Certaines fonctionnalités peuvent être limitées.</span>
        </div>
    );
}
