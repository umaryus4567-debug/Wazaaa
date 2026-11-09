import { auth, db } from "./firebase-config.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
    protectStaffPage
} from "./auth-utils.js";


/*==================================
STAFF PROTECTION
==================================*/

protectStaffPage();


const historyList =
    document.getElementById("historyList");

const historySearch =
    document.getElementById("historySearch");


let allHistory = [];


/*==================================
CHECK AUTHENTICATION
==================================*/

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.replace("login.html");

        return;

    }


    await loadStaffHistory();

});


/*==================================
LOAD ALL SERVICE HISTORY
==================================*/

async function loadStaffHistory() {

    historyList.innerHTML =
        "<p>Loading history...</p>";

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "service-history"
                )
            );


        allHistory = [];


        snapshot.forEach((documentItem) => {

            allHistory.push({

                id: documentItem.id,

                ...documentItem.data()

            });

        });


        

        renderHistory(allHistory);


    }

    catch (error) {

        console.error(
            "❌ STAFF HISTORY ERROR:",
            error
        );


        historyList.innerHTML = `

            <div class="empty">

                Failed to load service history.

            </div>

        `;

    }

}

/*==================================
SAFE HTML DISPLAY
==================================*/

function escapeHTML(value) {

    return String(value ?? "").replace(
        /[&<>"']/g,
        character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[character]
    );

}


/*==================================
FORMAT FIRESTORE DATES
==================================*/

function formatDate(value) {

    if (!value) return "Not available";

    if (typeof value.toDate === "function") {

        return value.toDate().toLocaleString();

    }

    return escapeHTML(value);

}


/*==================================
SERVICE LOCATION DETAILS
==================================*/

function getLocationDetails(data) {

    const line = (label, value) => {

        if (!value) return "";

        return `
            <p>
                <b>${label}:</b>
                ${escapeHTML(value)}
            </p>
        `;

    };

    const placeType =
        data.PlaceType || data.LocationType || "";

    let details = "";

    details += line("Location", data.Location);

    if (data.Location === "On Campus") {

        details += line("Campus", data.Campus);

        details += line("Category", placeType);

        if (placeType === "School") {

            details += line("School", data.School);

            details += line("School Code", data.SchoolCode);

        }

        details += line(
            "Building / Specific Location",
            data.Building || data.SpecificLocation
        );

        if (placeType === "Hostel") {

            details += line("Block", data.Block);

            details += line("Room", data.Room);

        }

    }

    else if (data.Location === "Off Campus") {

        details += line("Area", data.Area);

        details += line("Nearest Bus Stop", data.BusStop);

        details += line("Residential Address", data.Address);

        details += line("Nearest Landmark", data.Landmark);

    }

    else {

        // Support older archived requests.

        details += line("Area", data.Area);

        details += line("Bus Stop", data.BusStop);

        details += line("Address", data.Address);

        details += line("Landmark", data.Landmark);

    }

    details += line(
        "Additional Directions",
        data.Directions
    );

    return `
        <div class="history-location-details">

            <h4>📍 Service Location Details</h4>

            ${details || "<p>No location details available.</p>"}

        </div>
    `;

}


/*==================================
RENDER HISTORY
==================================*/

function renderHistory(history) {

    historyList.innerHTML = "";

    if (history.length === 0) {

        historyList.innerHTML = `

            <div class="empty">

                No archived service requests yet.

            </div>

        `;

        return;

    }

    history.forEach((data) => {

        const card =
            document.createElement("div");

        card.className = "history-card";

        const locationDetails =
            getLocationDetails(data);

        card.innerHTML = `

            <h3>
                ${escapeHTML(data.Customername || "Unknown Customer")}
            </h3>

            <p>
                <b>Request ID:</b>
                ${escapeHTML(data.id)}
            </p>

            <p>
                <b>Phone:</b>
                ${escapeHTML(data.Phone || "Not provided")}
            </p>

            ${locationDetails}

            <hr>

            <h4>⚡ Service Information</h4>

            <p>
                <b>Description:</b>
                ${escapeHTML(data.Description || "Not provided")}
            </p>

            <p>
                <b>Urgency:</b>
                ${escapeHTML(data.Urgency || "Not specified")}
            </p>

            <p>
                <b>Date Submitted:</b>
                ${formatDate(data.CreatedAt)}
            </p>

            <hr>

            <h4>👨‍🔧 Technician Information</h4>

            <p>
                <b>Technician:</b>
                ${escapeHTML(data.Technician || "Not Assigned")}
            </p>

            <p>
                <b>Technician Phone:</b>
                ${escapeHTML(data.TechnicianPhone || "Not provided")}
            </p>

            <hr>

            <h4>📋 Completion Information</h4>

            <p>
                <b>Status:</b>
                ${escapeHTML(data.Status || "Completed")}
            </p>

            <p>
                <b>Archived On:</b>
                ${formatDate(data.ArchivedAt)}
            </p>

        `;

        historyList.appendChild(card);

    });

}


/*==================================
SEARCH HISTORY
==================================*/

historySearch.addEventListener(
    "input",
    () => {

        const keyword =
            historySearch.value
                .toLowerCase()
                .trim();

        const filtered =
            allHistory.filter((request) => {

                const searchableFields = [

                    request.id,
                    request.Customername,
                    request.Phone,
                    request.Location,

                    request.Campus,
                    request.PlaceType,
                    request.LocationType,

                    request.School,
                    request.SchoolCode,

                    request.Building,
                    request.SpecificLocation,

                    request.Block,
                    request.Room,

                    request.Area,
                    request.BusStop,
                    request.Address,
                    request.Landmark,
                    request.Directions,

                    request.Description,
                    request.Urgency,

                    request.Technician,
                    request.TechnicianPhone,
                    request.Status

                ];

                return searchableFields.some(value =>

                    String(value || "")
                        .toLowerCase()
                        .includes(keyword)

                );

            });

        renderHistory(filtered);

    }

);