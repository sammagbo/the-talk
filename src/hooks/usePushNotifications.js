import { useState, useEffect } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "../firebase";

export const usePushNotifications = () => {
    const [token, setToken] = useState(null);
    const [notificationPermission, setNotificationPermission] = useState(Notification.permission);

    const requestPermission = async () => {
        try {
            const permission = await Notification.requestPermission();
            setNotificationPermission(permission);
            if (permission === "granted") {
                const currentToken = await getToken(messaging, {
                    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
                });
                if (currentToken) {
                    setToken(currentToken);
                    console.log("FCM Token:", currentToken);
                    // Here you would typically send the token to your server
                } else {
                    console.log("No registration token available. Request permission to generate one.");
                }
            }
        } catch (error) {
            console.error("An error occurred while retrieving token. ", error);
        }
    };

    useEffect(() => {
        const unsubscribe = onMessage(messaging, (payload) => {
            console.log("Message received. ", payload);
            new Notification(payload.notification.title, {
                body: payload.notification.body,
            });
        });
        return () => unsubscribe();
    }, []);

    return { token, notificationPermission, requestPermission };
};
