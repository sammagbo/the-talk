/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "REPLACE_WITH_YOUR_API_KEY", // Note: Service Workers don't access env vars easily without build steps. For now, we use a placeholder or assume user will hardcode for testing if needed, or use a workaround. 
    // BETTER APPROACH: We just initialize defaults if possible or rely on the fact that V8+ SDKs might auto-detect. 
    // However, compat libraries usually need config. 
    // Let's rely on the user or use a fetch approach if we want to be dynamic, but specific to this task, standard practice is often hardcoding in public SW or using a build script. 
    // I will use a placeholder comment.
    projectId: "the-talk-podcast",
    messagingSenderId: "REPLACE_WITH_SENDER_ID",
    appId: "REPLACE_WITH_APP_ID"
};

// Even better: try to initialize without config if possible (Varies by version) or just warn user.
// Simplest valid SW for basic background handling:

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/vite.svg'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
