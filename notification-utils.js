import { db } from "./firebase-config.js";

import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    updateDoc,
    doc,
    serverTimestamp,
    getDocs,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
/*==================================
CREATE NOTIFICATION
==================================*/

export async function createNotification(data) {

    try {

        const notification = {

            uid: data.uid,

            title: data.title,

            message: data.message,

            type: data.type || "info",

            icon: data.icon || "fa-bell",

            sender: data.sender || "system",

            link: data.link || "",

            read: false,

            createdAt: serverTimestamp()

        };

        const docRef = await addDoc(

            collection(db, "notifications"),

            notification

        );

        console.log("Notification created:", docRef.id);

        return docRef.id;

    }

    catch (error) {

        console.error("Notification Error:", error);

        throw error;

    }

}
/*==================================
LISTEN FOR NOTIFICATIONS
==================================*/

export function listenForNotifications(uid, callback) {

    try {

        const q = query(

            collection(db, "notifications"),

            where("uid", "==", uid),

            orderBy("createdAt", "desc")

        );

        return onSnapshot(

            q,

            (snapshot) => {

                const notifications = [];

                snapshot.forEach((document) => {

                    notifications.push({

                        id: document.id,

                        ...document.data()

                    });

                });

                callback(notifications);

            },

            (error) => {

                console.error(
                    "Notification Listener Error:",
                    error
                );

            }

        );

    }

    catch (error) {

        console.error(error);

    }

}
/*==================================
MARK ALL AS READ
==================================*/

export async function markAllNotificationsAsRead(uid) {

    try {

        const q = query(

            collection(db, "notifications"),

            where("uid", "==", uid),

            where("read", "==", false)

        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {

            console.log("No unread notifications.");

            return;

        }

        const promises = [];

        snapshot.forEach((document) => {

            promises.push(

                updateDoc(

                    doc(db, "notifications", document.id),

                    {
                        read: true
                    }

                )

            );

        });

        await Promise.all(promises);

        console.log("All notifications marked as read.");

    }

    catch (error) {

        console.error(

            "Mark Notifications Error:",

            error

        );

        throw error;

    }

}

/*==================================
DELETE NOTIFICATION
==================================*/

export async function deleteNotification(notificationId) {

    try {

        await deleteDoc(

            doc(db, "notifications", notificationId)

        );

        console.log(

            "Notification deleted:",

            notificationId

        );

    }

    catch (error) {

        console.error(

            "Delete Notification Error:",

            error

        );

        throw error;

    }

}
/*==================================
CLEAR ALL NOTIFICATIONS
==================================*/

export async function clearAllNotifications(uid) {

    try {

        const q = query(

            collection(db, "notifications"),

            where("uid", "==", uid)

        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {

            console.log("No notifications to delete.");

            return;

        }

        const promises = [];

        snapshot.forEach((document) => {

            promises.push(

                deleteDoc(

                    doc(db, "notifications", document.id)

                )

            );

        });

        await Promise.all(promises);

        console.log("All notifications cleared.");

    }

    catch (error) {

        console.error(

            "Clear Notifications Error:",

            error

        );

        throw error;

    }

}