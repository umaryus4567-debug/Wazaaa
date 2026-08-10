import { auth, db } from "./firebase-config.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
    prompt: "select_account"
});
async function saveUserData(user, data = {}) {

    const userRef = doc(db, "users", user.uid);

    try {

        console.log(
            "Preparing user profile:",
            user.uid
        );

        const snapshot = await getDoc(userRef);

        const existingData = snapshot.exists()
            ? snapshot.data()
            : {};

        const userData = {

            uid: user.uid,

            fullName:
                data.fullName ||
                user.displayName ||
                existingData.fullName ||
                "Customer",

            email:
                user.email ||
                existingData.email ||
                "",

            phone:
                data.phone ||
                existingData.phone ||
                "",

            role:
                existingData.role ||
                data.role ||
                "customer",

            accountStatus:
                existingData.accountStatus ||
                "active",

            provider:
                data.provider ||
                existingData.provider ||
                user.providerData[0]?.providerId ||
                "email",

            photoURL:
                user.photoURL ||
                existingData.photoURL ||
                "",

            createdAt:
                existingData.createdAt ||
                serverTimestamp(),

            updatedAt:
                serverTimestamp(),

            lastLogin:
                serverTimestamp()

        };

        console.log(
            "Saving user document:",
            user.uid
        );

        await setDoc(
            userRef,
            userData
        );

        console.log(
            "✅ USER PROFILE SAVED"
        );

        console.log(
            "UID:",
            user.uid
        );

        console.log(
            "PATH:",
            `users/${user.uid}`
        );

        return userData;

    }

    catch (error) {

        console.error(
            "❌ FIRESTORE USER SAVE ERROR:",
            error
        );

        throw error;

    }

}
/*==================================
REGISTER USER
==================================*/

export async function registerUser(fullName, email, password, phone) {

    try {

        console.log("Creating authentication account...");

        const credential =
        await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        const user = credential.user;

        console.log("Authentication account created.");

        await updateProfile(user, {
            displayName: fullName
        });

        console.log("Saving user to Firestore...");

        const savedData = await saveUserData(user, {

    fullName: fullName,

    phone: phone,

    provider: "email"

});

console.log("✅ USER PROFILE CREATED:", savedData);
console.log("✅ USER PROFILE PATH:", `users/${user.uid}`);

        console.log("User successfully saved.");

        return user;

    }

    catch(error){

        console.error("REGISTER ERROR:", error);

        throw error;

    }

}

/*==================================
LOGIN USER
==================================*/

export async function loginUser(email, password) {

    try {

        console.log("Logging user in...");

        const credential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        const user = credential.user;

        console.log(
            "Authentication successful:",
            user.uid
        );


        /*==================================
        GET USER DOCUMENT
        ==================================*/

        const userRef =
            doc(db, "users", user.uid);

        const snap =
            await getDoc(userRef);


        /*==================================
        USER DOCUMENT MISSING
        ==================================*/

        if (!snap.exists()) {

            console.log(
                "User document missing. Recreating..."
            );

            await saveUserData(user, {

                fullName:
                    user.displayName ||
                    "Customer",

                phone: "",

                provider:
                    user.providerData[0]?.providerId ||
                    "email"

            });

        }


        /*==================================
        CHECK ACCOUNT STATUS
        ==================================*/

        else {

            const data = snap.data();

            const accountStatus =
                data.accountStatus || "active";


            console.log(
                "Account Status:",
                accountStatus
            );


            /*==================================
            SUSPENDED
            ==================================*/

            if (accountStatus === "suspended") {

                console.warn(
                    "⚠️ Account suspended."
                );

                await signOut(auth);

                window.location.replace(
                    "account-suspended.html"
                );

                return null;

            }


            /*==================================
            DISABLED
            ==================================*/

            if (accountStatus === "disabled") {

                console.warn(
                    "🚫 Account disabled."
                );

                await signOut(auth);

                window.location.replace(
                    "account-disabled.html"
                );

                return null;

            }


            /*==================================
            ACTIVE
            ==================================*/

            await updateDoc(userRef, {

                lastLogin:
                    serverTimestamp(),

                updatedAt:
                    serverTimestamp()

            });

        }


        console.log(
            "✅ Login successful."
        );

        return user;

    }

    catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );

        throw error;

    }

}
/*==================================
GOOGLE LOGIN
==================================*/

export async function googleLogin() {

    try {

        console.log("Opening Google popup...");

        const result =
        await signInWithPopup(
            auth,
            googleProvider
        );

        const user = result.user;

        console.log("Google account:", user.uid);

        await saveUserData(user, {

            fullName:
            user.displayName || "Customer",

            phone: "",

            provider: "google"

        });

        console.log("Google login successful.");

        return user;

    }

    catch (error) {

        console.error("GOOGLE LOGIN ERROR:", error);

        throw error;

    }

}

/*==================================
LOGOUT USER
==================================*/

export async function logoutUser() {

    try {

        await signOut(auth);

        console.log("User signed out.");

    }

    catch(error){

        console.error("LOGOUT ERROR:", error);

        throw error;

    }

}
/*==================================
PROTECT PAGE
==================================*/

export function protectPage() {

    return new Promise((resolve, reject) => {

        const unsubscribe = onAuthStateChanged(auth, (user) => {

            unsubscribe();

            if (!user) {

                console.log("No user found. Redirecting to login.");

                window.location.replace("login.html");

                return;

            }

            console.log("Authenticated:", user.uid);

            resolve(user);

        }, (error) => {

            console.error("AUTH ERROR:", error);

            reject(error);

        });

    });

}
/*==================================
LOAD USER
==================================*/

export async function loadUser() {

    const user = auth.currentUser;

    if (!user) return;

    try {

        const snap = await getDoc(
            doc(db, "users", user.uid)
        );

        if (!snap.exists()) {

            console.warn("User document not found.");

            return;

        }

        const data = snap.data();

        const userName =
        document.getElementById("userName");

        const userEmail =
        document.getElementById("userEmail");

        const userImage =
        document.getElementById("userImage");

        if (userName)
            userName.textContent =
            data.fullName;

        if (userEmail)
            userEmail.textContent =
            data.email;

        if (userImage)
            userImage.src =
            data.photoURL || "default-user.png";

    }

    catch (error) {

        console.error("Load User Error:", error);

    }

}

/*==================================
GUEST ONLY
==================================*/

export function guestOnly() {

    return new Promise((resolve) => {

        onAuthStateChanged(auth, (user) => {

            if (user) {

                console.log("User already logged in.");

                window.location.replace("home.html");

                return;

            }

            resolve();

        });

    });

}
/*==================================
STAFF ONLY
==================================*/

export function protectStaffPage() {

    return new Promise((resolve, reject) => {

        onAuthStateChanged(auth, async (user) => {

            if (!user) {

                window.location.replace("login.html");

                return;

            }

            try {

                const snap =
                await getDoc(
                    doc(db, "users", user.uid)
                );

                if (!snap.exists()) {

                    window.location.replace("home.html");

                    return;

                }

                const data = snap.data();

                if (data.role !== "staff") {

                    console.warn("Access denied.");

                    window.location.replace("home.html");

                    return;

                }

                resolve(user);

            }

            catch (error) {

                console.error("Staff Guard Error:", error);

                reject(error);

            }

        });

    });

}

export async function resetPassword(email) {

    try {

        console.log("Sending password reset email...");

        await sendPasswordResetEmail(
            auth,
            email.trim().toLowerCase()
        );

        console.log(
            "Password reset email sent successfully."
        );

    }

    catch (error) {

        console.error(
            "PASSWORD RESET ERROR:",
            error
        );

        throw error;

    }

}

export { auth, db };