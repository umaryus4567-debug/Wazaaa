import {
    loginUser,
    guestOnly,
    logoutUser
} from "./auth-utils.js";

import { db } from "./firebase-config.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

// Only guests should access this page
guestOnly();

// DOM Elements
const form = document.getElementById("loginForm");
const email = document.getElementById("email");
const password = document.getElementById("password");

/*==================================
LOADING
==================================*/

const loginButton = form.querySelector("button");

function setLoading(state){

    if(state){

        loginButton.disabled = true;
        loginButton.innerHTML = `
            <ion-icon name="hourglass-outline"></ion-icon>
            Signing In...
        `;

    }else{

        loginButton.disabled = false;
        loginButton.innerHTML = `
            <ion-icon name="lock-closed"></ion-icon>
            Login
        `;

    }

}
/*==================================
STAFF LOGIN
==================================*/

form.addEventListener("submit", async (e)=>{

    e.preventDefault();

    const emailValue =
    email.value.trim().toLowerCase();

    const passwordValue =
    password.value.trim();


    if(emailValue === ""){

        alert("Please enter your email.");

        email.focus();

        return;

    }


    if(passwordValue === ""){

        alert("Please enter your password.");

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


        const userSnapshot =
        await getDoc(
            doc(
                db,
                "users",
                user.uid
            )
        );


        if(!userSnapshot.exists()){

            await logoutUser();

            setLoading(false);

            alert(
            "User account record not found."
            );

            return;

        }


        const userData =
        userSnapshot.data();



        if(userData.role !== "staff"){

            await logoutUser();

            setLoading(false);

            alert(
            "Access denied. Staff account only."
            );

            return;

        }



        alert(
        "Staff login successful ✅"
        );


        window.location.replace(
        "dashboard.html"
        );


    }


    catch(error){


        setLoading(false);


        console.error(error);



        if(error.code === "auth/invalid-credential"){

            alert(
            "Invalid email or password."
            );

        }

        else if(error.code === "auth/network-request-failed"){

            alert(
            "Check your internet connection."
            );

        }

        else{

            alert(
            error.message
            );

        }

    }


});