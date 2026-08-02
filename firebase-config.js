import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCtK8uoKkaZVVnzRFOplPxLNxKnpVCf24Q",
    authDomain: "rose-a7757.firebaseapp.com",
    projectId: "rose-a7757",
    storageBucket: "rose-a7757.firebasestorage.app",
    messagingSenderId: "648446292944",
    appId: "1:648446292944:web:8e50120d78800d4d487fd5",
    measurementId: "G-F9HXZJEBTE"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

export { app, auth, db };