/*==================================================
UY POWER SOLUTIONS
PROFILE
Part 1
==================================================*/

import { auth, db } from "./firebase-config.js";

import { protectPage } from "./auth-utils.js";

import {
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import {
    onAuthStateChanged,
    getAuth,
    updatePassword,
    EmailAuthProvider,
    reauthenticateWithCredential
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

console.log("Imported Auth =", auth);
console.log("Fresh Auth =", getAuth());

/*==================================
PROTECT PAGE
==================================*/

//protectPage();

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

console.log("Profile.js Loaded Successfully");

/*==================================
LOAD USER DATA
==================================*/

onAuthStateChanged(auth, async (user) => {
console.log("USER =", user);
console.log("UID =", user?.uid);
console.log("EMAIL =", user?.email);
console.log("CURRENT TYPE =", typeof auth.currentUser);

console.log("AUTH OBJECT =", auth);

console.log("CURRENT VALUE =", auth.currentUser);

console.log("ALL AUTH KEYS =", Object.keys(auth));
    if (!user) return;

    try {

        const userRef = doc(db, "users", user.uid);

        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {

            console.log("User document not found.");

            return;

        }

        const data = userSnap.data();

        /*==============================
        PROFILE CARD
        ==============================*/

        displayName.textContent =
            data.fullName || user.displayName || "Customer";

        displayEmail.textContent =
            user.email;

        /*==============================
        INPUTS
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

        provider.textContent =
            data.provider === "google"
            ? "Google Account"
            : "Email Account";

        /*==============================
        MEMBER SINCE
        ==============================*/

        if (data.createdAt?.toDate) {

            memberSince.textContent =
                data.createdAt
                    .toDate()
                    .toLocaleDateString();

        } else {

            memberSince.textContent =
                "Unavailable";

        }

        console.log("Profile Loaded Successfully");

    }

    catch (error) {

        console.error(error);

    }

});

/*==================================
SAVE PROFILE
==================================*/

saveProfile.addEventListener("click", async () => {

    const user = auth.currentUser;

    if (!user) return;

    try {

        saveProfile.disabled = true;

        saveProfile.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

        await updateDoc(

            doc(db, "users", user.uid),

            {

                fullName: fullName.value.trim(),

                phone: phone.value.trim()

            }

        );

        displayName.textContent =
        fullName.value.trim();

        showToast("Profile updated successfully");

    }

    catch (error) {

        console.error(error);

        alert("Unable to update profile.");

    }

    finally {

        saveProfile.disabled = false;

        saveProfile.innerHTML =
        '<i class="fa-solid fa-floppy-disk"></i> Save Changes';

    }

});

/*==================================
OPEN PASSWORD MODAL
==================================*/

changePassword.addEventListener("click", () => {

    const user = auth.currentUser;

    if (!user) return;

    const providerId = user.providerData[0]?.providerId;

    if (providerId === "google.com") {

        alert(
            "Your password is managed through your Google account."
        );

        return;

    }

    passwordModal.style.display = "flex";

});

/*==================================
CLOSE PASSWORD MODAL
==================================*/

cancelPassword.addEventListener("click", () => {

    passwordModal.style.display = "none";

    newPassword.value = "";

    confirmNewPassword.value = "";

});

/*==================================
UPDATE PASSWORD
==================================*/

savePassword.addEventListener("click", async () => {

    const user = auth.currentUser;

    if (!user) return;

    if (newPassword.value.trim().length < 6) {

        alert("Password must be at least 6 characters.");

        return;

    }

    if (newPassword.value !== confirmNewPassword.value) {

        alert("Passwords do not match.");

        return;

    }

    try {

        savePassword.disabled = true;

        savePassword.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Updating...';

const credential = EmailAuthProvider.credential(

    user.email,

    currentPassword.value

);

await reauthenticateWithCredential(

    user,

    credential

);

await updatePassword(

    user,

    newPassword.value

);

        alert("Password updated successfully.");

        passwordModal.style.display = "none";

        currentPassword.value = "";

        newPassword.value = "";

        confirmNewPassword.value = "";

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

    finally {

        savePassword.disabled = false;

        savePassword.innerHTML = "Update Password";

    }

});
window.addEventListener("load", () => {

    setTimeout(() => {

        document
            .getElementById("loader")
            ?.classList.add("loader-hide");

    }, 700);

});

