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

        

        await setDoc(
            userRef,
            userData
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



        const credential =
        await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        const user = credential.user;

        

        await updateProfile(user, {
            displayName: fullName
        });

        

        const savedData = await saveUserData(user, {

    fullName: fullName,

    phone: phone,

    provider: "email"

});


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

        

        const credential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        const user = credential.user;

        

        return user;

    } catch (error) {

        console.error(
            "❌ FIREBASE AUTHENTICATION ERROR:",
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



        const result =
        await signInWithPopup(
            auth,
            googleProvider
        );

        const user = result.user;

;

        await saveUserData(user, {

            fullName:
            user.displayName || "Customer",

            phone: "",

            provider: "google"

        });

        

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

        

    }

    catch(error){



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



                window.location.replace("login.html");

                return;

            }

            

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

        

        await sendPasswordResetEmail(
            auth,
            email.trim().toLowerCase()
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