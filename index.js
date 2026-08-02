/*==================================================
UY POWER SOLUTIONS
REGISTRATION
==================================================*/
import {
    guestOnly,
    registerUser,
    googleLogin
} from "./auth-utils.js";

import {
    createNotification
} from "./notification-utils.js";

/*==================================
GUEST ONLY
==================================*/

guestOnly();

/*==================================
DOM ELEMENTS
==================================*/

const registerForm =
document.getElementById("registerForm");

const fullName =
document.getElementById("fullName");

const email =
document.getElementById("email");

const phone =
document.getElementById("phone");

const password =
document.getElementById("password");

const confirmPassword =
document.getElementById("confirmPassword");

const agreeTerms =
document.getElementById("agreeTerms");

const registerButton =
document.getElementById("registerButton");

const googleRegister =
document.getElementById("googleRegister");

const togglePassword =
document.getElementById("togglePassword");

const toggleConfirmPassword =
document.getElementById("toggleConfirmPassword");

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

const successModal =
document.getElementById("successModal");

console.log("Registration Page Ready");

/*==================================
SHOW LOADING
==================================*/

function showLoading(){

    loadingScreen.style.display="flex";

    buttonText.style.display="none";

    buttonLoader.style.display="inline-block";

    registerButton.disabled=true;

    googleRegister.disabled=true;

}

/*==================================
HIDE LOADING
==================================*/

function hideLoading(){

    loadingScreen.style.display="none";

    buttonText.style.display="inline";

    buttonLoader.style.display="none";

    registerButton.disabled=false;

    googleRegister.disabled=false;

}

/*==================================
TOAST
==================================*/

function showToast(message,type="success"){

    toastMessage.textContent=message;

    toast.classList.add("show");

    if(type==="success"){

        toast.style.borderLeft="6px solid #22c55e";

        toastIcon.className="fa-solid fa-circle-check";

    }

    else{

        toast.style.borderLeft="6px solid #ef4444";

        toastIcon.className="fa-solid fa-circle-xmark";

    }

    setTimeout(()=>{

        toast.classList.remove("show");

    },3000);

}

/*==================================
SUCCESS MODAL
==================================*/

function showSuccessModal(){

    successModal.style.display="flex";

}

/*==================================
PASSWORD TOGGLE
==================================*/

function toggleVisibility(input,button){

    const icon=button.querySelector("i");

    if(input.type==="password"){

        input.type="text";

        icon.classList.replace(
            "fa-eye",
            "fa-eye-slash"
        );

    }

    else{

        input.type="password";

        icon.classList.replace(
            "fa-eye-slash",
            "fa-eye"
        );

    }

}

togglePassword.addEventListener("click",()=>{

    toggleVisibility(
        password,
        togglePassword
    );

});

toggleConfirmPassword.addEventListener("click",()=>{

    toggleVisibility(
        confirmPassword,
        toggleConfirmPassword
    );

});

/*==================================================
PART 2
VALIDATION
==================================================*/

function validateEmail(email){

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email.trim()
    );

}

function validatePhone(phone){

    return /^[0-9]{11}$/.test(
        phone.trim()
    );

}

function clearErrors(){

    document.querySelectorAll("input").forEach(input=>{

        input.style.borderColor="#e2e8f0";

    });

}

function markInvalid(input){

    input.style.borderColor="#ef4444";

    input.focus();

}

function validateForm(){

    clearErrors();

    if(fullName.value.trim().length < 3){

        showToast(
            "Full name must contain at least 3 characters.",
            "error"
        );

        markInvalid(fullName);

        return false;

    }

    if(!validateEmail(email.value)){

        showToast(
            "Please enter a valid email address.",
            "error"
        );

        markInvalid(email);

        return false;

    }

    if(!validatePhone(phone.value)){

        showToast(
            "Phone number must contain exactly 11 digits.",
            "error"
        );

        markInvalid(phone);

        return false;

    }

    if(password.value.length < 6){

        showToast(
            "Password must be at least 6 characters.",
            "error"
        );

        markInvalid(password);

        return false;

    }

    if(password.value !== confirmPassword.value){

        showToast(
            "Passwords do not match.",
            "error"
        );

        markInvalid(confirmPassword);

        return false;

    }

    if(!agreeTerms.checked){

        showToast(
            "Please agree to the Terms & Conditions.",
            "error"
        );

        return false;

    }

    return true;

}
/*==================================================
PART 3
REGISTER USER
==================================================*/

registerForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    if (!validateForm()) return;

    showLoading();

    try {

        const user = await registerUser(

            fullName.value.trim(),

            email.value.trim().toLowerCase(),

            password.value,

            phone.value.trim()

        );

        await createNotification({

            uid: user.uid,

            title: "Welcome to UY Power Solutions",

            message: "Your account has been created successfully. Welcome aboard!",

            type: "success",

            icon: "fa-circle-check",

            sender: "system",

            link: "home.html"

        });

        hideLoading();

        showToast(
            "Account created successfully!"
        );

        showSuccessModal();

        registerForm.reset();

        setTimeout(() => {

            window.location.href = "login.html";

        }, 2000);

    }

    catch(error){

        hideLoading();

        console.error(error);

        switch(error.code){

            case "auth/email-already-in-use":

                showToast(
                    "This email is already registered.",
                    "error"
                );

                markInvalid(email);

                break;

            case "auth/invalid-email":

                showToast(
                    "Invalid email address.",
                    "error"
                );

                markInvalid(email);

                break;

            case "auth/weak-password":

                showToast(
                    "Password is too weak.",
                    "error"
                );

                markInvalid(password);

                break;

            case "auth/network-request-failed":

                showToast(
                    "Please check your internet connection.",
                    "error"
                );

                break;

            default:

                showToast(
                    error.message,
                    "error"
                );

        }

    }

});
/*==================================================
PART 4
GOOGLE REGISTRATION
==================================================*/

googleRegister.addEventListener("click", async () => {
  console.log("Google button clicked");
alert("Google button clicked");

    showLoading();

    try {

        const user = await googleLogin();

        await createNotification({

            uid: user.uid,

            title: "Welcome to UY Power Solutions",

            message: "Your Google account has been registered successfully.",

            type: "success",

            icon: "fa-google",

            sender: "system",

            link: "home.html"

        });

        hideLoading();

        showToast(
            "Google registration successful!"
        );

        showSuccessModal();

        setTimeout(() => {

            window.location.href = "home.html";

        }, 1800);

    }

    catch(error){

        hideLoading();

        console.error(error);

        switch(error.code){

            case "auth/popup-closed-by-user":

                showToast(
                    "Google sign in was cancelled.",
                    "error"
                );

                break;

            case "auth/popup-blocked":

                showToast(
                    "Popup blocked by your browser.",
                    "error"
                );

                break;

            case "auth/network-request-failed":

                showToast(
                    "Please check your internet connection.",
                    "error"
                );

                break;

            default:

                showToast(
                    error.message,
                    "error"
                );

        }

    }

});

/*==================================================
STARTUP
==================================================*/

window.addEventListener("load", () => {

    console.log("====================================");

    console.log("UY POWER SOLUTIONS");

    console.log("Registration System Ready");

    console.log("Firebase Connected");

    console.log("====================================");

});

/*==================================================
PAGE LOADER
==================================================*/

window.addEventListener("load", () => {

    const loader = document.getElementById("loader");

    if(loader){

        setTimeout(() => {

            loader.classList.add("loader-hide");

        },700);

    }

});