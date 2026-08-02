/*==================================================
UY POWER SOLUTIONS
LOGIN
==================================================*/

import {
    guestOnly,
    loginUser,
    googleLogin,
    resetPassword
} from "./auth-utils.js";

import {
    createNotification
} from "./notification-utils.js";

/*==================================
GUEST ONLY
==================================*/

guestOnly();

/*==================================
DOM
==================================*/

const loginForm =
document.getElementById("loginForm");

const email =
document.getElementById("email");

const password =
document.getElementById("password");

const remember =
document.getElementById("remember");

const authButton =
document.getElementById("authButton");

const googleButton =
document.getElementById("googleLogin");

const forgotPassword =
document.getElementById("forgotPassword");

const togglePassword =
document.getElementById("togglePassword");

const loadingScreen =
document.getElementById("loadingScreen");

const buttonText =
document.getElementById("buttonText");

const buttonLoader =
document.getElementById("buttonLoader");

const toast =
document.getElementById("toast");

const toastMessage =
document.getElementById("toastMessage");

const toastIcon =
document.getElementById("toastIcon");

console.log("Login Page Loaded");

/*==================================================
PART 2
UI FUNCTIONS
==================================================*/

/*==================================
SHOW LOADING
==================================*/

function showLoading() {

    loadingScreen.style.display = "flex";

    buttonText.style.display = "none";

    buttonLoader.style.display = "inline-block";

    authButton.disabled = true;

    googleButton.disabled = true;

}

/*==================================
HIDE LOADING
==================================*/

function hideLoading() {

    loadingScreen.style.display = "none";

    buttonText.style.display = "inline";

    buttonLoader.style.display = "none";

    authButton.disabled = false;

    googleButton.disabled = false;

}

/*==================================
SHOW TOAST
==================================*/

function showToast(message, type = "success") {

    toastMessage.textContent = message;

    toast.classList.add("show");

    if (type === "success") {

        toast.style.borderLeft = "6px solid #22c55e";

        toastIcon.className = "fa-solid fa-circle-check";

    }

    else {

        toast.style.borderLeft = "6px solid #ef4444";

        toastIcon.className = "fa-solid fa-circle-xmark";

    }

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}

/*==================================
PASSWORD TOGGLE
==================================*/

togglePassword.addEventListener("click", () => {

    const icon = togglePassword.querySelector("i");

    if (password.type === "password") {

        password.type = "text";

        icon.classList.replace("fa-eye", "fa-eye-slash");

    }

    else {

        password.type = "password";

        icon.classList.replace("fa-eye-slash", "fa-eye");

    }

});

/*==================================
REMEMBER EMAIL
==================================*/

window.addEventListener("load", () => {

    const savedEmail = localStorage.getItem("rememberEmail");

    if (savedEmail) {

        email.value = savedEmail;

        remember.checked = true;

    }

});

function saveRememberEmail() {

    if (remember.checked) {

        localStorage.setItem("rememberEmail", email.value);

    }

    else {

        localStorage.removeItem("rememberEmail");

    }

}

remember.addEventListener("change", saveRememberEmail);

email.addEventListener("keyup", saveRememberEmail);

/*==================================================
PART 3
LOGIN
==================================================*/

loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const emailValue = email.value.trim().toLowerCase();

    const passwordValue = password.value.trim();

    if (emailValue === "") {

        showToast("Please enter your email.", "error");

        email.focus();

        return;

    }

    if (passwordValue === "") {

        showToast("Please enter your password.", "error");

        password.focus();

        return;

    }

    showLoading();

    try {

        const user = await loginUser(

            emailValue,

            passwordValue

        );

        await createNotification({

            uid: user.uid,

            title: "Login Successful",

            message: "Welcome back to UY Power Solutions.",

            type: "success",

            icon: "fa-right-to-bracket",

            sender: "system",

            link: "home.html"

        });

        hideLoading();

        showToast("Login successful!");

        setTimeout(() => {

            window.location.href = "home.html";

        }, 1200);

    }

    catch (error) {

        hideLoading();

        console.error(error);

        switch (error.code) {

            case "auth/invalid-credential":

                showToast("Invalid email or password.", "error");

                break;

            case "auth/user-not-found":

                showToast("Account not found.", "error");

                break;

            case "auth/wrong-password":

                showToast("Incorrect password.", "error");

                break;

            case "auth/network-request-failed":

                showToast("Please check your internet connection.", "error");

                break;

            default:

                showToast(error.message, "error");

        }

    }

});

/*==================================================
PART 4
GOOGLE LOGIN
==================================================*/

googleButton.addEventListener("click", async () => {

    showLoading();

    try {

        const user = await googleLogin();

        await createNotification({

            uid: user.uid,

            title: "Google Login",

            message: "You logged in successfully with Google.",

            type: "success",

            icon: "fa-google",

            sender: "system",

            link: "home.html"

        });

        hideLoading();

        showToast("Google Login Successful!");

        setTimeout(() => {

            window.location.href = "home.html";

        }, 1200);

    }

    catch (error) {

        hideLoading();

        console.error(error);

        switch (error.code) {

            case "auth/popup-closed-by-user":

                showToast("Google sign in cancelled.", "error");

                break;

            case "auth/popup-blocked":

                showToast("Popup was blocked by your browser.", "error");

                break;

            case "auth/network-request-failed":

                showToast("Please check your internet connection.", "error");

                break;

            default:

                showToast(error.message, "error");

        }

    }

});

/*==================================================
FORGOT PASSWORD
==================================================*/

forgotPassword.addEventListener("click", async (e) => {

    e.preventDefault();

    const emailValue = email.value.trim();

    if (!emailValue) {

        showToast("Enter your email first.", "error");

        email.focus();

        return;

    }

    try {

        await resetPassword(emailValue);

        showToast("Password reset email sent.");

    }

    catch (error) {

        console.error(error);

        showToast(error.message, "error");

    }

});

/*==================================================
PART 5
STARTUP
==================================================*/

window.addEventListener("load", () => {

    console.log("====================================");

    console.log("UY POWER SOLUTIONS");

    console.log("Login System Ready");

    console.log("Firebase Connected");

    console.log("Google Authentication Ready");

    console.log("====================================");

});

window.addEventListener("load", () => {

    setTimeout(() => {

        document
            .getElementById("loader")
            ?.classList.add("loader-hide");

    }, 700);

});