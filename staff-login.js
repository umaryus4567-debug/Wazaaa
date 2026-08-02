import {
    auth,
    guestOnly,
    loginUser,
    resetPassword,
    logoutUser
} from "./auth-utils.js";

import { db } from "./firebase-config.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

/*==================================
GUEST ONLY
==================================*/

guestOnly();

/*==================================
DOM
==================================*/

const form =
document.getElementById("loginForm");

const email =
document.getElementById("email");

const password =
document.getElementById("password");

/*==================================
UI ELEMENTS
==================================*/

const remember =
document.querySelector(".options input[type='checkbox']");

const forgotPassword =
document.querySelector(".options a");

/*==================================
LOADING
==================================*/

function setLoading(isLoading){

    const button =
    form.querySelector("button");

    if(isLoading){

        button.disabled = true;

        button.innerHTML = `
        <ion-icon name="reload"></ion-icon>
        Signing In...
        `;

    }

    else{

        button.disabled = false;

        button.innerHTML = `
        <ion-icon name="lock-closed"></ion-icon>
        Login
        `;

    }

}
/*==================================
TOAST
==================================*/

function showToast(message,type="success"){

    const toast =
    document.getElementById("toast");

    const icon =
    document.getElementById("toastIcon");

    const text =
    document.getElementById("toastMessage");

    text.textContent = message;

    if(type==="success"){

        toast.style.borderLeftColor="#22c55e";

        icon.setAttribute(
        "name",
        "checkmark-circle"
        );

        icon.style.color="#22c55e";

    }

    else{

        toast.style.borderLeftColor="#ef4444";

        icon.setAttribute(
        "name",
        "close-circle"
        );

        icon.style.color="#ef4444";

    }

    toast.classList.add("show");

    setTimeout(()=>{

        toast.classList.remove("show");

    },3000);

}
/*==================================
REMEMBER ME
==================================*/

window.addEventListener("load",()=>{

    const savedEmail =
    localStorage.getItem("staffRememberEmail");

    if(savedEmail){

        email.value = savedEmail;

        remember.checked = true;

    }

});

function saveRememberEmail(){

    if(remember.checked){

        localStorage.setItem(
            "staffRememberEmail",
            email.value
        );

    }

    else{

        localStorage.removeItem(
            "staffRememberEmail"
        );

    }

}

remember.addEventListener(
"change",
saveRememberEmail);

email.addEventListener(
"keyup",
saveRememberEmail);

/*==================================
STAFF LOGIN
==================================*/

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const emailValue =
    email.value.trim().toLowerCase();

    const passwordValue =
    password.value.trim();

    if(emailValue === ""){

        showToast("Please enter your email.","error");

        email.focus();

        return;

    }

    if(passwordValue === ""){

        showToast("Please enter your password.","error");

        password.focus();

        return;

    }

    setLoading(true);

    try{

        const user =
        await loginUser(
            emailValue,
            passwordValue
        );

        const userDoc =
        await getDoc(
            doc(db,"users",user.uid)
        );

        if(!userDoc.exists()){

            setLoading(false);

            showToast(
            "User record not found."
            );

            return;

        }

        const data =
        userDoc.data();
        
        
        if(data.role !== "staff"){

    await logoutUser();

    setLoading(false);

    showToast(
    "Access denied. Staff only."
    );

    return;

}

        showToast(
        "Welcome back, Staff!"
        );

        setTimeout(()=>{
          
          window.location.href =
"dashboard.html";


        },1000);

    }

    catch(error){

        setLoading(false);

        console.error(error);

        showToast(error.message);

    }

});

/*==================================
FORGOT PASSWORD
==================================*/

forgotPassword.addEventListener("click", async (e) => {

    e.preventDefault();

    const emailValue =
    email.value.trim();

    if(emailValue === ""){

        showToast(
            "Enter your email first.",
            "error"
        );

        email.focus();

        return;

    }

    try{

        await resetPassword(emailValue);

        showToast(
            "Password reset email sent."
        );

    }

    catch(error){

        console.error(error);

        showToast(
            error.message,
            "error"
        );

    }

});
/*==================================
PASSWORD TOGGLE
==================================*/

const togglePassword =
document.getElementById("togglePassword");

togglePassword.addEventListener("click",()=>{

    const icon =
    togglePassword.querySelector("ion-icon");

    if(password.type==="password"){

        password.type="text";

        icon.setAttribute(
        "name",
        "eye-off-outline"
        );

    }

    else{

        password.type="password";

        icon.setAttribute(
        "name",
        "eye-outline"
        );

    }

});