import { auth, db } from "./firebase-config.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import {
    createNotification
} from "./notification-utils.js";

const form =
    document.getElementById("serviceRequestForm");


/*==================================
AUTHENTICATION
==================================*/

onAuthStateChanged(auth, (user) => {

    if (!user) {

        console.warn(
            "❌ No authenticated customer."
        );

        window.location.replace("login.html");

        return;

    }

    console.log(
        "✅ Request page authenticated:",
        user.uid
    );

});


/*==================================
SERVICE REQUEST FORM
==================================*/

form.addEventListener("submit", async (e) => {

    e.preventDefault();


    /*==================================
    GET CURRENT USER
    ==================================*/

    const user = auth.currentUser;

    if (!user) {

        alert(
            "Your session has expired. Please login again."
        );

        window.location.replace("login.html");

        return;

    }


    console.log(
        "👤 Customer UID:",
        user.uid
    );


    /*==================================
    GET FORM DATA
    ==================================*/

    const customerName =
        document
        .getElementById("customerName")
        .value
        .trim();

    const phone =
        document
        .getElementById("phone")
        .value
        .trim();

    const location =
        document
        .getElementById("location")
        .value;

    const area =
        document
        .getElementById("area")
        .value
        .trim();

    const busStop =
        document
        .getElementById("busStop")
        .value
        .trim();

    const address =
        document
        .getElementById("address")
        .value
        .trim();

    const description =
        document
        .getElementById("description")
        .value
        .trim();

    const urgency =
        document.querySelector(
            'input[name="urgency"]:checked'
        )?.value || "";


    /*==================================
    SUBMIT BUTTON
    ==================================*/

    const submitBtn =
        document.querySelector(
            'button[type="submit"]'
        );

    submitBtn.disabled = true;

    submitBtn.innerHTML =
        '<span class="spinner"></span> Submitting...';


    /*==================================
    CREATE SERVICE REQUEST
    ==================================*/

    try {

        const requestData = {

            /*
            ==================================
            CUSTOMER ACCOUNT CONNECTION
            ==================================
            */

            CustomerId: user.uid,

            /*
            ==================================
            CUSTOMER INFORMATION
            ==================================
            */

            Customername: customerName,

            Phone: phone,

            /*
            ==================================
            LOCATION
            ==================================
            */

            Location: location,

            Area: area,

            BusStop: busStop,

            Address: address,

            /*
            ==================================
            SERVICE DETAILS
            ==================================
            */

            Description: description,

            Urgency: urgency,

            /*
            ==================================
            REQUEST STATUS
            ==================================
            */

            Status: "Pending",

            /*
            ==================================
            TIMESTAMP
            ==================================
            */

            CreatedAt: serverTimestamp()

        };


        console.log(
            "📦 Preparing service request:",
            requestData
        );


        const requestRef =
            await addDoc(
                collection(
                    db,
                    "service-request"
                ),
                requestData
            );
            
            /*==================================
CREATE CUSTOMER NOTIFICATION
==================================*/

await createNotification({

    uid: user.uid,

    requestId: requestRef.id,

    title: "Request Submitted",

    message:
        "Your electrical service request has been received and is awaiting review.",

    type: "request_submitted",

    icon: "fa-file-circle-check",

    sender: "system",

    link: ""

});


        /*==================================
        SUCCESS
        ==================================*/

        console.log(
            "✅ SERVICE REQUEST CREATED"
        );

        console.log(
            "Request ID:",
            requestRef.id
        );

        console.log(
            "Customer ID:",
            user.uid
        );


        document.getElementById(
            "successMessage"
        ).textContent =
            "✅ Request submitted successfully. A technician will review your request shortly.";


        submitBtn.disabled = false;

        submitBtn.textContent =
            "Submit Request ✅";


        form.reset();

    }


    /*==================================
    ERROR
    ==================================*/

    catch (error) {

        console.error(
            "❌ SERVICE REQUEST ERROR:",
            error
        );


        submitBtn.disabled = false;

        submitBtn.textContent =
            "Submit Request ✅";


        alert(
            error.message
        );

    }

});


/*==================================
PAGE LOADER
==================================*/

window.addEventListener("load", () => {

    setTimeout(() => {

        document
            .getElementById("loader")
            ?.classList.add("loader-hide");

    }, 700);

});