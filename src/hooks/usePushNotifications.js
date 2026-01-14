/**
 * Push Notifications Hook
 * Manages Web Push subscription with Supabase backend
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../context/AuthContext";

// VAPID Public Key - safe to expose
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BCbmpxJoV4Jx4ha2act02WzaedvsmISOphxdBmsunWbmS66N8ya7wgdnNMbA0Xl3ZeyNoQnmF96MI78eoYVEgmE';

/**
 * Convert VAPID key to Uint8Array for PushManager
 */
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export const usePushNotifications = () => {
    const { user } = useAuth();

    // Check if Push API is supported
    const isSupported = typeof window !== 'undefined' &&
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window;

    const [permission, setPermission] = useState(
        isSupported ? Notification.permission : 'denied'
    );
    const [subscription, setSubscription] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Register service worker and get existing subscription
     */
    useEffect(() => {
        if (!isSupported) return;

        const initServiceWorker = async () => {
            try {
                const registration = await navigator.serviceWorker.register('/sw-push.js');
                console.log('[Push] Service worker registered:', registration);

                // Check for existing subscription
                const existingSub = await registration.pushManager.getSubscription();
                if (existingSub) {
                    setSubscription(existingSub);
                }
            } catch (err) {
                console.error('[Push] Service worker registration failed:', err);
            }
        };

        initServiceWorker();
    }, [isSupported]);

    /**
     * Subscribe to push notifications
     */
    const subscribe = useCallback(async () => {
        if (!isSupported || !user) {
            setError('Push notifications not supported or user not logged in');
            return null;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Request notification permission
            const permissionResult = await Notification.requestPermission();
            setPermission(permissionResult);

            if (permissionResult !== 'granted') {
                setError('Notification permission denied');
                setIsLoading(false);
                return null;
            }

            // Get service worker registration
            const registration = await navigator.serviceWorker.ready;

            // Subscribe to push
            const pushSubscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });

            console.log('[Push] Subscribed:', pushSubscription);
            setSubscription(pushSubscription);

            // Save subscription to Supabase
            const subscriptionData = pushSubscription.toJSON();

            const { error: dbError } = await supabase
                .from('push_subscriptions')
                .upsert({
                    user_id: user.uid,
                    endpoint: subscriptionData.endpoint,
                    p256dh: subscriptionData.keys?.p256dh,
                    auth: subscriptionData.keys?.auth,
                    last_used_at: new Date().toISOString()
                }, {
                    onConflict: 'endpoint'
                });

            if (dbError) {
                console.error('[Push] Error saving subscription:', dbError);
                setError('Failed to save subscription');
            } else {
                console.log('[Push] Subscription saved to Supabase');
            }

            setIsLoading(false);
            return pushSubscription;

        } catch (err) {
            console.error('[Push] Subscription error:', err);
            setError(err.message);
            setIsLoading(false);
            return null;
        }
    }, [isSupported, user]);

    /**
     * Unsubscribe from push notifications
     */
    const unsubscribe = useCallback(async () => {
        if (!subscription) return;

        setIsLoading(true);

        try {
            await subscription.unsubscribe();

            // Remove from Supabase
            if (user) {
                await supabase
                    .from('push_subscriptions')
                    .delete()
                    .eq('endpoint', subscription.endpoint);
            }

            setSubscription(null);
            console.log('[Push] Unsubscribed successfully');

        } catch (err) {
            console.error('[Push] Unsubscribe error:', err);
            setError(err.message);
        }

        setIsLoading(false);
    }, [subscription, user]);

    /**
     * Send a test notification (local)
     */
    const sendTestNotification = useCallback(async () => {
        if (permission !== 'granted') {
            await subscribe();
        }

        const registration = await navigator.serviceWorker.ready;

        registration.showNotification('THE TALK 🎙️', {
            body: 'As notificações estão funcionando!',
            icon: '/pwa-192x192.png',
            badge: '/pwa-192x192.png',
            vibrate: [100, 50, 100],
            data: { url: '/' }
        });
    }, [permission, subscribe]);

    return {
        isSupported,
        permission,
        subscription,
        isLoading,
        error,
        subscribe,
        unsubscribe,
        sendTestNotification,
        isSubscribed: !!subscription
    };
};

export default usePushNotifications;
