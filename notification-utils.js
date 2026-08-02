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
export async function createNotification(data) {

    await addDoc(
        collection(db, "notifications"),
        {

            uid: data.uid,

            title: data.title,

            message: data.message,

            type: data.type || "info",

            icon: data.icon || "fa-bell",

            sender: data.sender || "system",

            link: data.link || "",

            read: false,

            createdAt: serverTimestamp()

        }
    );

}
export function listenForNotifications(uid, callback) {

    const q = query(
        collection(db, "notifications"),
        where("uid", "==", uid),
        orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {

        const notifications = [];

        snapshot.forEach((doc) => {

            notifications.push({

                id: doc.id,

                ...doc.data()

            });

        });

        callback(notifications);

    });

}
export async function markAllNotificationsAsRead(uid) {

    const q = query(
        collection(db, "notifications"),
        where("uid", "==", uid),
        where("read", "==", false)
    );

    const snapshot = await getDocs(q);

    const promises = [];

    snapshot.forEach((document) => {

        promises.push(

            updateDoc(doc(db, "notifications", document.id), {

                read: true

            })

        );

    });

    await Promise.all(promises);

}

export async function deleteNotification(notificationId) {

    await deleteDoc(
        doc(db, "notifications", notificationId)
    );

}
export async function clearAllNotifications(uid) {

    const q = query(
        collection(db, "notifications"),
        where("uid", "==", uid)
    );

    const snapshot = await getDocs(q);

    const promises = [];

    snapshot.forEach((document) => {

        promises.push(

            deleteDoc(
                doc(db, "notifications", document.id)
            )

        );

    });

    await Promise.all(promises);

}