
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


/*==================================
FORM ELEMENTS
==================================*/

const form = document.getElementById("serviceRequestForm");

const submitBtn = form.querySelector('button[type="submit"]');

const successMessage = document.getElementById("successMessage");


/*==================================
FUTMINNA LOCATION SYSTEM
==================================*/

const locationSelect = document.getElementById("location");
const campusSelect = document.getElementById("campus");
const placeTypeSelect = document.getElementById("placeType");
const schoolSelect = document.getElementById("school");

const specificLocationInput =
    document.getElementById("specificLocation");

const blockInput = document.getElementById("block");
const roomInput = document.getElementById("room");

const areaInput = document.getElementById("area");
const busStopInput = document.getElementById("busStop");
const addressInput = document.getElementById("address");
const landmarkInput = document.getElementById("landmark");
const directionsInput = document.getElementById("directions");


/*==================================
SHOW / HIDE LOCATION GROUPS
==================================*/

function showLocationGroup(id, show) {

    const group = document.getElementById(id);

    if (group) {
        group.hidden = !show;
    }

}


/*==================================
UPDATE LOCATION FIELDS
==================================*/

function updateLocationFields() {

    const location = locationSelect.value;
    const placeType = placeTypeSelect.value;

    const onCampus = location === "On Campus";
    const offCampus = location === "Off Campus";

    const isHostel = placeType === "Hostel";
    const isSchool = placeType === "School";


    /* ON-CAMPUS FIELDS */

    showLocationGroup("campusGroup", onCampus);

    showLocationGroup("placeTypeGroup", onCampus);

    showLocationGroup(
        "specificLocationGroup",
        onCampus && !!placeType
    );

    showLocationGroup(
        "schoolGroup",
        onCampus && isSchool
    );

    showLocationGroup(
        "blockGroup",
        onCampus && isHostel
    );

    showLocationGroup(
        "roomGroup",
        onCampus && isHostel
    );


    /* OFF-CAMPUS FIELDS */

    showLocationGroup("areaGroup", offCampus);

    showLocationGroup("busStopGroup", offCampus);

    showLocationGroup("addressGroup", offCampus);

    showLocationGroup("landmarkGroup", offCampus);


    /* ADDITIONAL DIRECTIONS */

    showLocationGroup(
        "directionsGroup",
        onCampus || offCampus
    );


    /* REQUIRED FIELDS */

    campusSelect.required = onCampus;

    placeTypeSelect.required = onCampus;

    schoolSelect.required = onCampus && isSchool;

    specificLocationInput.required =
        onCampus && !!placeType;

    areaInput.required = offCampus;

    addressInput.required = offCampus;


    /* RESET HIDDEN ON-CAMPUS FIELDS */

    if (!onCampus) {

        campusSelect.value = "";

        placeTypeSelect.value = "";

    }

    if (!onCampus || !isSchool) {

        schoolSelect.value = "";

    }

    if (!onCampus || !placeType) {

        specificLocationInput.value = "";

    }

    if (!onCampus || !isHostel) {

        blockInput.value = "";

        roomInput.value = "";

    }


    /* RESET HIDDEN OFF-CAMPUS FIELDS */

    if (!offCampus) {

        areaInput.value = "";

        busStopInput.value = "";

        addressInput.value = "";

        landmarkInput.value = "";

    }


    /* RESET DIRECTIONS WHEN NO LOCATION IS SELECTED */

    if (!onCampus && !offCampus) {

        directionsInput.value = "";

    }

}


/*==================================
LOCATION EVENT LISTENERS
==================================*/

locationSelect.addEventListener(
    "change",
    updateLocationFields
);

campusSelect.addEventListener(
    "change",
    updateLocationFields
);

placeTypeSelect.addEventListener(
    "change",
    updateLocationFields
);


/* INITIAL LOCATION STATE */

updateLocationFields();


/*==================================
AUTHENTICATION
==================================*/

onAuthStateChanged(auth, (user) => {

    if (!user) {

        console.warn(
            "No authenticated customer."
        );

        window.location.replace("login.html");

        return;

    }

});


/*==================================
SERVICE REQUEST FORM
==================================*/

form.addEventListener("submit", async (e) => {

    e.preventDefault();


    /*==================================
    CHECK AUTHENTICATED USER
    ==================================*/

    const user = auth.currentUser;

    if (!user) {

        alert(
            "Your session has expired. Please login again."
        );

        window.location.replace("login.html");

        return;

    }


    /*==================================
    GET CUSTOMER INFORMATION
    ==================================*/

    const customerName =
        document.getElementById("customerName")
            .value.trim();

    const phone =
        document.getElementById("phone")
            .value.trim();


    /*==================================
    GET LOCATION INFORMATION
    ==================================*/

    const location = locationSelect.value;

    const campus = campusSelect.value;

    const placeType = placeTypeSelect.value;

    const schoolCode = schoolSelect.value;

    const school =
        schoolSelect.selectedIndex > 0
            ? schoolSelect.options[schoolSelect.selectedIndex].text
            : "";


    const specificLocation =
        specificLocationInput.value.trim();

    const building = specificLocation;

    const block = blockInput.value.trim();

    const room = roomInput.value.trim();

    const area = areaInput.value.trim();

    const busStop = busStopInput.value.trim();

    const address = addressInput.value.trim();

    const landmark = landmarkInput.value.trim();

    const directions = directionsInput.value.trim();


    /*==================================
    GET SERVICE INFORMATION
    ==================================*/

    const description =
        document.getElementById("description")
            .value.trim();

    const urgency =
        document.querySelector(
            'input[name="urgency"]:checked'
        )?.value || "";


    /*==================================
    PREVENT DUPLICATE SUBMISSIONS
    ==================================*/

    submitBtn.disabled = true;

    submitBtn.innerHTML =
        '<span class="spinner"></span> Submitting...';

    successMessage.textContent = "";


    /*==================================
    CREATE SERVICE REQUEST
    ==================================*/

    try {

        const requestData = {

            /* CUSTOMER ACCOUNT */

            CustomerId: user.uid,


            /* CUSTOMER INFORMATION */

            Customername: customerName,

            Phone: phone,


            /* LOCATION INFORMATION */

            Location: location,

            LocationType: placeType,

            Campus: campus,

            PlaceType: placeType,

            School: school,

            SchoolCode: schoolCode,

            SpecificLocation: specificLocation,

            Building: building,

            Block: block,

            Room: room,

            Area: area,

            BusStop: busStop,

            Address: address,

            Landmark: landmark,

            Directions: directions,


            /* SERVICE DETAILS */

            Description: description,

            Urgency: urgency,


            /* REQUEST STATUS */

            Status: "Pending",


            /* TIMESTAMP */

            CreatedAt: serverTimestamp()

        };


        /* SAVE TO FIRESTORE */

        const requestRef = await addDoc(

            collection(db, "service-request"),

            requestData

        );


        console.log(
            "SERVICE REQUEST CREATED:",
            requestRef.id
        );


        /*==================================
        CUSTOMER NOTIFICATION
        ==================================*/

        try {

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

        }

        catch (customerNotificationError) {

            console.error(
                "FAILED TO CREATE CUSTOMER NOTIFICATION:",
                customerNotificationError
            );

        }


        /*==================================
        STAFF NOTIFICATION
        ==================================*/

        try {

            await createNotification({

                uid: "staff",

                requestId: requestRef.id,

                title: "🔔 New Service Request",

                message:
                    `${customerName} submitted a new electrical service request.`,

                type: "new_service_request",

                icon: "fa-file-circle-plus",

                sender: "customer",

                link: "dashboard.html"

            });

        }

        catch (staffNotificationError) {

            console.error(
                "FAILED TO CREATE STAFF NOTIFICATION:",
                staffNotificationError
            );

        }


        /*==================================
        SUCCESS MESSAGE
        ==================================*/

        successMessage.textContent =
            "✅ Request submitted successfully. A technician will review your request shortly.";


/* RESET FORM */

form.reset();

updateLocationFields();


/*==================================
OPEN WHATSAPP NOTIFICATION
==================================*/

const whatsappMessage =
    `🔔 UY POWER SOLUTIONS\n` +
    `A new service request has arrived!\n` +
    `Please check the staff dashboard for details.`;

const whatsappUrl =
    `https://wa.me/2348163196577?text=` +
    encodeURIComponent(whatsappMessage);

window.location.href = whatsappUrl;

}

/*==================================
ERROR HANDLING
==================================*/

catch (error) {

    console.error(
        "SERVICE REQUEST ERROR:",
        error
    );

    alert(
        "Unable to submit your request. Please try again.\n\n" +
        error.message
    );

}

finally {

    submitBtn.disabled = false;

    submitBtn.textContent = "Submit Request";

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

})