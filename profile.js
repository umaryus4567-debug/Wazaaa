/*==================================================
UY POWER SOLUTIONS
PROFILE SYSTEM
==================================================*/

import { auth, db } from "./firebase-config.js";

import {
    doc,
    getDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import {
    onAuthStateChanged,
    updateProfile,
    updatePassword,
    EmailAuthProvider,
    reauthenticateWithCredential
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
    protectPage
} from "./auth-utils.js";


/*==================================
PROTECT PAGE
==================================*/

protectPage();


/*==================================
DOM ELEMENTS
==================================*/

const profileImage =
    document.getElementById("profileImage");

const displayName =
    document.getElementById("displayName");

const displayEmail =
    document.getElementById("displayEmail");

const fullName =
    document.getElementById("fullName");

const phone =
    document.getElementById("phone");

const email =
    document.getElementById("email");

const provider =
    document.getElementById("provider");

const memberSince =
    document.getElementById("memberSince");

const saveProfile =
    document.getElementById("saveProfile");

const changePhoto =
    document.getElementById("changePhoto");

const changePassword =
    document.getElementById("changePassword");

const passwordModal =
    document.getElementById("passwordModal");

const currentPassword =
    document.getElementById("currentPassword");

const newPassword =
    document.getElementById("newPassword");

const confirmNewPassword =
    document.getElementById("confirmNewPassword");

const cancelPassword =
    document.getElementById("cancelPassword");

const savePassword =
    document.getElementById("savePassword");


console.log("=================================");
console.log("UY POWER SOLUTIONS");
console.log("Profile System Loaded");
console.log("=================================");


/*==================================
TOAST
==================================*/

function showToast(message, type = "success") {

    let toast =
        document.getElementById("profileToast");

    /*
    Create toast if it doesn't exist
    */

    if (!toast) {

        toast = document.createElement("div");

        toast.id = "profileToast";

        toast.style.position = "fixed";
        toast.style.bottom = "25px";
        toast.style.left = "50%";
        toast.style.transform = "translateX(-50%)";
        toast.style.padding = "14px 22px";
        toast.style.borderRadius = "12px";
        toast.style.color = "#fff";
        toast.style.fontWeight = "600";
        toast.style.fontFamily = "Poppins, sans-serif";
        toast.style.zIndex = "99999";
        toast.style.boxShadow =
            "0 10px 30px rgba(0,0,0,.25)";
        toast.style.transition = ".3s";

        document.body.appendChild(toast);

    }

    toast.textContent = message;

    toast.style.background =
        type === "error"
            ? "#ef4444"
            : "#22c55e";

    toast.style.opacity = "1";

    clearTimeout(toast._timer);

    toast._timer = setTimeout(() => {

        toast.style.opacity = "0";

    }, 3000);

}


/*==================================
LOAD USER DATA
==================================*/

onAuthStateChanged(auth, async (user) => {

    console.log("Authenticated user:", user?.uid);

    if (!user) {

        console.log("No authenticated user.");

        return;

    }

    try {

        const userRef =
            doc(db, "users", user.uid);

        const userSnap =
            await getDoc(userRef);


        if (!userSnap.exists()) {

            console.warn(
                "User document does not exist:",
                user.uid
            );

            showToast(
                "Your profile data could not be found.",
                "error"
            );

            return;

        }


        const data =
            userSnap.data();


        /*==============================
        PROFILE CARD
        ==============================*/

        displayName.textContent =
            data.fullName ||
            user.displayName ||
            "Customer";


        displayEmail.textContent =
            user.email || "";


        /*==============================
        PERSONAL INFORMATION
        ==============================*/

        fullName.value =
            data.fullName || "";


        phone.value =
            data.phone || "";


        email.value =
            user.email || "";


        /*==============================
        PROFILE IMAGE
        ==============================*/

        profileImage.src =
            data.photoURL ||
            user.photoURL ||
            "default-user.png";


        /*==============================
        PROVIDER
        ==============================*/

        if (data.provider === "google") {

            provider.textContent =
                "Google Account";

        }

        else {

            provider.textContent =
                "Email Account";

        }


        /*==============================
        MEMBER SINCE
        ==============================*/

        if (
            data.createdAt &&
            typeof data.createdAt.toDate === "function"
        ) {

            memberSince.textContent =
                data.createdAt
                    .toDate()
                    .toLocaleDateString();

        }

        else {

            memberSince.textContent =
                "Unavailable";

        }


        console.log(
            "✅ Profile Loaded Successfully"
        );

    }

    catch (error) {

        console.error(
            "PROFILE LOAD ERROR:",
            error
        );

        showToast(
            "Unable to load your profile.",
            "error"
        );

    }

});


/*==================================
SAVE PROFILE
==================================*/

saveProfile.addEventListener(
    "click",
    async () => {

        const user =
            auth.currentUser;


        if (!user) {

            showToast(
                "You are not logged in.",
                "error"
            );

            return;

        }


        const name =
            fullName.value.trim();

        const phoneNumber =
            phone.value.trim();


        /*==============================
        VALIDATION
        ==============================*/

        if (name.length < 3) {

            showToast(
                "Full name must contain at least 3 characters.",
                "error"
            );

            fullName.focus();

            return;

        }


        if (
            phoneNumber &&
            !/^[0-9]{11}$/.test(phoneNumber)
        ) {

            showToast(
                "Phone number must contain exactly 11 digits.",
                "error"
            );

            phone.focus();

            return;

        }


        try {

            saveProfile.disabled = true;

            saveProfile.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Saving...
            `;


            /*==============================
            UPDATE FIREBASE AUTH
            ==============================*/

            await updateProfile(user, {

                displayName: name

            });


            /*==============================
            UPDATE FIRESTORE
            ==============================*/

            await updateDoc(

                doc(db, "users", user.uid),

                {

                    fullName: name,

                    phone: phoneNumber,

                    updatedAt:
                        serverTimestamp()

                }

            );


            /*==============================
            UPDATE UI
            ==============================*/

            displayName.textContent =
                name;


            showToast(
                "Profile updated successfully."
            );


            console.log(
                "✅ Profile updated:",
                user.uid
            );

        }

        catch (error) {

            console.error(
                "PROFILE UPDATE ERROR:",
                error
            );

            showToast(
                "Unable to update your profile.",
                "error"
            );

        }

        finally {

            saveProfile.disabled =
                false;

            saveProfile.innerHTML = `
                <i class="fa-solid fa-floppy-disk"></i>
                Save Changes
            `;

        }

    }
);


/*==================================
OPEN PASSWORD MODAL
==================================*/

changePassword.addEventListener(
    "click",
    () => {

        const user =
            auth.currentUser;


        if (!user) {

            showToast(
                "You are not logged in.",
                "error"
            );

            return;

        }


        const providerId =
            user.providerData[0]?.providerId;


        if (providerId === "google.com") {

            showToast(
                "Your password is managed through Google.",
                "error"
            );

            return;

        }


        passwordModal.style.display =
            "flex";

    }
);


/*==================================
CLOSE PASSWORD MODAL
==================================*/

cancelPassword.addEventListener(
    "click",
    () => {

        passwordModal.style.display =
            "none";


        currentPassword.value = "";

        newPassword.value = "";

        confirmNewPassword.value = "";

    }
);


/*==================================
UPDATE PASSWORD
==================================*/

savePassword.addEventListener(
    "click",
    async () => {

        const user =
            auth.currentUser;


        if (!user) {

            showToast(
                "You are not logged in.",
                "error"
            );

            return;

        }


        const current =
            currentPassword.value;

        const newPass =
            newPassword.value;

        const confirm =
            confirmNewPassword.value;


        /*==============================
        VALIDATION
        ==============================*/

        if (!current) {

            showToast(
                "Please enter your current password.",
                "error"
            );

            currentPassword.focus();

            return;

        }


        if (newPass.length < 6) {

            showToast(
                "New password must be at least 6 characters.",
                "error"
            );

            newPassword.focus();

            return;

        }


        if (newPass !== confirm) {

            showToast(
                "Passwords do not match.",
                "error"
            );

            confirmNewPassword.focus();

            return;

        }


        try {

            savePassword.disabled = true;

            savePassword.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Updating...
            `;


            /*==============================
            REAUTHENTICATE USER
            ==============================*/

            const credential =
                EmailAuthProvider.credential(
                    user.email,
                    current
                );


            await reauthenticateWithCredential(
                user,
                credential
            );


            /*==============================
            UPDATE PASSWORD
            ==============================*/

            await updatePassword(
                user,
                newPass
            );


            /*==============================
            SUCCESS
            ==============================*/

            showToast(
                "Password updated successfully."
            );


            passwordModal.style.display =
                "none";


            currentPassword.value = "";

            newPassword.value = "";

            confirmNewPassword.value = "";


            console.log(
                "✅ Password updated successfully"
            );

        }

        catch (error) {

            console.error(
                "PASSWORD UPDATE ERROR:",
                error
            );


            if (
                error.code ===
                "auth/invalid-credential"
            ) {

                showToast(
                    "Current password is incorrect.",
                    "error"
                );

            }

            else if (
                error.code ===
                "auth/weak-password"
            ) {

                showToast(
                    "The new password is too weak.",
                    "error"
                );

            }

            else {

                showToast(
                    error.message,
                    "error"
                );

            }

        }

        finally {

            savePassword.disabled =
                false;

            savePassword.innerHTML = `
                <i class="fa-solid fa-lock"></i>
                Update Password
            `;

        }

    }
);


/*==================================
PHOTO BUTTON
==================================*/

changePhoto.addEventListener(
    "click",
    () => {

        showToast(
            "Photo upload will be added next."
        );

    }
);


/*==================================
PAGE LOADER
==================================*/

window.addEventListener(
    "load",
    () => {

        setTimeout(() => {

            document
                .getElementById("loader")
                ?.classList.add(
                    "loader-hide"
                );

        }, 700);

    }
);