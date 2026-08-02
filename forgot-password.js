/*==================================================
UY POWER SOLUTIONS
Forgot Password
Part 1
Firebase Initialization
==================================================*/
import { app } from "./firebase-config.js";

import {

getAuth,

sendPasswordResetEmail

} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

/*==============================
INITIALIZE FIREBASE
==============================*/

const auth = getAuth(app);

console.log("Forgot Password Loaded Successfully");

/*==============================
DOM ELEMENTS
==============================*/

const resetForm = document.getElementById("resetForm");

const emailInput = document.getElementById("email");

const resetButton = document.getElementById("resetButton");

const buttonText = document.getElementById("buttonText");

const buttonLoader = document.getElementById("buttonLoader");

const loadingScreen = document.getElementById("loadingScreen");

const toast = document.getElementById("toast");

const toastMessage = document.getElementById("toastMessage");

const toastIcon = document.getElementById("toastIcon");

const alertBox = document.getElementById("alertBox");

/*==============================
EMAIL VALIDATION
==============================*/

function validateEmail(email){

const pattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

return pattern.test(email);

}

/*==============================
SHOW LOADING
==============================*/

function showLoading(){

loadingScreen.style.display="flex";

buttonText.style.display="none";

buttonLoader.style.display="inline-block";

resetButton.disabled=true;

}

/*==============================
HIDE LOADING
==============================*/

function hideLoading(){

loadingScreen.style.display="none";

buttonText.style.display="inline";

buttonLoader.style.display="none";

resetButton.disabled=false;

}

/*==================================================
UY POWER SOLUTIONS
Forgot Password
Part 2
UI Functions & Validation
==================================================*/

/*==============================
SHOW TOAST
==============================*/

function showToast(message,type="success"){

toastMessage.textContent=message;

toast.classList.add("show");

if(type==="success"){

toast.style.borderLeft="6px solid #22c55e";

toastIcon.className="fa-solid fa-circle-check";

toastIcon.style.color="#22c55e";

}

else{

toast.style.borderLeft="6px solid #ef4444";

toastIcon.className="fa-solid fa-circle-xmark";

toastIcon.style.color="#ef4444";

}

setTimeout(()=>{

toast.classList.remove("show");

},3500);

}

/*==============================
SHOW ALERT
==============================*/

function showAlert(message,type="success"){

alertBox.style.display="block";

alertBox.textContent=message;

if(type==="success"){

alertBox.style.background="#dcfce7";

alertBox.style.color="#166534";

alertBox.style.border="1px solid #22c55e";

}

else{

alertBox.style.background="#fee2e2";

alertBox.style.color="#991b1b";

alertBox.style.border="1px solid #ef4444";

}

}

/*==============================
HIDE ALERT
==============================*/

function hideAlert(){

alertBox.style.display="none";

}

/*==============================
INPUT ANIMATION
==============================*/

emailInput.addEventListener("focus",()=>{

emailInput.parentElement.style.transform="translateY(-2px)";

});

emailInput.addEventListener("blur",()=>{

emailInput.parentElement.style.transform="translateY(0)";

});

/*==============================
FORM VALIDATION
==============================*/



/*==================================================
UY POWER SOLUTIONS
Forgot Password
Part 3
Firebase Password Reset
==================================================*/

resetForm.addEventListener("submit", async(e)=>{

e.preventDefault();

hideAlert();

const email = emailInput.value.trim();

if(email===""){

showToast("Please enter your email address.","error");

emailInput.focus();

return;

}

if(!validateEmail(email)){

showToast("Please enter a valid email address.","error");

emailInput.focus();

return;

}

showLoading();

try{
await sendPasswordResetEmail(auth,email);
hideLoading();

showAlert(

"Password reset link has been sent to your email.",

"success"

);

showToast(

"Reset email sent successfully."

);

resetForm.reset();

/* Redirect back after 4 seconds */

setTimeout(()=>{

window.location.href="login.html";

},4000);

}

catch(error){

hideLoading();

console.error(error);

switch(error.code){

case "auth/user-not-found":

showToast(

"No account found with this email.",

"error"

);

break;

case "auth/invalid-email":

showToast(

"Invalid email address.",

"error"

);

break;

case "auth/network-request-failed":

showToast(

"Network error. Please check your internet connection.",

"error"

);

break;

case "auth/too-many-requests":

showToast(

"Too many requests. Please try again later.",

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