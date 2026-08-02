/*==================================================
UY POWER SOLUTIONS
AUTH GUARD
==================================================*/

import { auth } from "./auth-utils.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

/*==================================
PAGE LOADER
==================================*/

const pageLoader =
document.getElementById("pageLoader");

/*==================================
PROTECT PAGE
==================================*/

onAuthStateChanged(auth, (user) => {

    if (user) {

        console.log("✅ User Logged In");

        if (pageLoader) {

            pageLoader.style.display = "none";

        }

    }

    else {

        console.log("❌ User Not Logged In");

        window.location.replace("login.html");

    }

});