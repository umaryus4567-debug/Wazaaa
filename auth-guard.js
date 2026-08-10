/*==================================================
UY POWER SOLUTIONS
AUTH + ACCOUNT STATUS GUARD
==================================================*/

import { auth } from "./auth-utils.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import { db } from "./firebase-config.js";


/*==================================
AUTH GUARD PROMISE
==================================*/

export const authReady = new Promise((resolve, reject) => {

    onAuthStateChanged(auth, async (user) => {

        console.log("================================");
        console.log("🔐 AUTH GUARD STARTED");
        console.log("================================");


        /*==================================
        NO USER
        ==================================*/

        if (!user) {

            console.log(
                "❌ NO AUTHENTICATED USER"
            );

            window.location.replace(
                "login.html"
            );

            return;
        }


        console.log(
            "✅ AUTH USER FOUND:",
            user.uid
        );


        try {

            /*==================================
            FIRESTORE USER DOCUMENT
            ==================================*/

            const userRef =
                doc(
                    db,
                    "users",
                    user.uid
                );


            console.log(
                "📄 Reading Firestore:",
                `users/${user.uid}`
            );


            const snapshot =
                await getDoc(userRef);


            /*==================================
            DOCUMENT DOES NOT EXIST
            ==================================*/

            if (!snapshot.exists()) {

                console.warn(
                    "⚠️ USER DOCUMENT DOES NOT EXIST"
                );

                await signOut(auth);

                window.location.replace(
                    "login.html"
                );

                return;
            }


            console.log(
                "✅ FIRESTORE DOCUMENT EXISTS"
            );


            /*==================================
            USER DATA
            ==================================*/

            const data =
                snapshot.data();


            console.log(
                "👤 USER DATA:",
                data
            );


            const role =
                data.role || "customer";


            const accountStatus =
                String(
                    data.accountStatus || "active"
                )
                .trim()
                .toLowerCase();


            console.log(
                "👤 ROLE:",
                role
            );


            console.log(
                "🔐 ACCOUNT STATUS:",
                accountStatus
            );


            /*==================================
            SUSPENDED
            ==================================*/

            if (
                accountStatus === "suspended"
            ) {

                console.warn(
                    "⚠️ ACCOUNT SUSPENDED"
                );

                await signOut(auth);

                window.location.replace(
                    "login.html?status=suspended"
                );

                return;
            }


            /*==================================
            DISABLED
            ==================================*/

            if (
                accountStatus === "disabled"
            ) {

                console.warn(
                    "🚫 ACCOUNT DISABLED"
                );

                await signOut(auth);

                window.location.replace(
                    "login.html?status=disabled"
                );

                return;
            }


            /*==================================
            UNKNOWN STATUS
            ==================================*/

            if (
                accountStatus !== "active"
            ) {

                console.warn(
                    "⚠️ UNKNOWN ACCOUNT STATUS:",
                    accountStatus
                );

                await signOut(auth);

                window.location.replace(
                    "login.html?status=unknown"
                );

                return;
            }


            /*==================================
            ACTIVE
            ==================================*/

            console.log(
                "✅ ACCOUNT ACTIVE"
            );

            console.log(
                "🔓 ACCESS GRANTED"
            );


            /*==================================
            RELEASE HOME PAGE
            ==================================*/

            resolve({
                user,
                data,
                role,
                accountStatus
            });


            console.log(
                "================================"
            );

        }

        catch (error) {

            console.error(
                "❌ AUTH GUARD ERROR:",
                error
            );


            reject(error);


            await signOut(auth);


            window.location.replace(
                "login.html"
            );

        }

    });

});