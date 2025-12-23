import { useState, useEffect } from "react";

export const usePushNotifications = () => {
    // Check if Notification API is available (not available in iOS Safari unless installed as PWA)
    const isNotificationSupported = typeof window !== 'undefined' && 'Notification' in window;

    const [token] = useState(null);
    const [notificationPermission, setNotificationPermission] = useState(
        isNotificationSupported ? Notification.permission : 'denied'
    );

    const requestPermission = async () => {
        if (!isNotificationSupported) {
            console.warn("Notifications not supported on this device/browser");
            return;
        }

        try {
            const permission = await Notification.requestPermission();
            setNotificationPermission(permission);
            if (permission === "granted") {
                console.warn("Messaging not initialized in firebase.js");
            }
        } catch (error) {
            console.error("An error occurred while retrieving token. ", error);
        }
    };

    useEffect(() => {
        // Update permission state if it changes externally
        if (isNotificationSupported) {
            setNotificationPermission(Notification.permission);
        }
    }, [isNotificationSupported]);

    return { token, notificationPermission, requestPermission, isNotificationSupported };
};
