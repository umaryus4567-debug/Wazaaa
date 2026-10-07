importScripts(
    "https://www.gstatic.com/firebasejs/12.15.0/firebase-app-compat.js"
);

importScripts(
    "https://www.gstatic.com/firebasejs/12.15.0/firebase-messaging-compat.js"
);

const firebaseConfig = {
    apiKey: "AIzaSyCtK8uoKkaZVVnzRFOplPxLNxKnpVCf24Q",
    authDomain: "rose-a7757.firebaseapp.com",
    projectId: "rose-a7757",
    storageBucket: "rose-a7757.firebasestorage.app",
    messagingSenderId: "648446292944",
    appId: "1:648446292944:web:8e50120d78800d4d487fd5",
    measurementId: "G-F9HXZJEBTE"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {

    console.log(
        "📩 Background notification received:",
        payload
    );

    const notificationTitle =
        payload.notification?.title ||
        "UY Power Solutions";

    const notificationOptions = {

        body:
            payload.notification?.body ||
            "You have a new notification.",

        icon: "/Wazaaa/favicon.ico",

        data: {
            url:
                payload.data?.url ||
                "/Wazaaa/dashboard.html"
        }

    };

    self.registration.showNotification(
        notificationTitle,
        notificationOptions
    );

});

self.addEventListener(
    "notificationclick",
    (event) => {

        event.notification.close();

        const targetUrl =
            event.notification?.data?.url ||
            "/Wazaaa/dashboard.html";

        event.waitUntil(

            clients.matchAll({
                type: "window",
                includeUncontrolled: true
            })

            .then((clientList) => {

                for (const client of clientList) {

                    if (
                        "focus" in client &&
                        client.url.includes(
                            "/Wazaaa/"
                        )
                    ) {

                        client.navigate(targetUrl);

                        return client.focus();

                    }

                }

                if (clients.openWindow) {

                    return clients.openWindow(
                        targetUrl
                    );

                }

            })

        );

    }
);