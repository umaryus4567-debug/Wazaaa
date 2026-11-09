import { auth, db } from "./firebase-config.js";

import {
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";


const searchBtn =
    document.getElementById("searchBtn");

const refreshBtn =
    document.getElementById("refreshBtn");

const result =
    document.getElementById("result");

const searchInput =
    document.getElementById("searchInput");


let currentUser = null;


/* =========================================
   AUTHENTICATION
========================================= */

onAuthStateChanged(auth, (user) => {

    if (!user) {

        console.log(
            "❌ Track page requires login."
        );

        result.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">🔐</div>

                <h3>Login Required</h3>

                <p>
                    Please login to track your service request.
                </p>

                <a href="login.html">
                    Login
                </a>

            </div>

        `;

        searchBtn.disabled = true;

        return;
    }


    currentUser = user;

    searchBtn.disabled = false;


    console.log(
        "✅ Track page authenticated:",
        user.uid
    );

});


/* =========================================
   ENTER KEY
========================================= */

searchInput.addEventListener(
    "keypress",
    (e) => {

        if (e.key === "Enter") {

            searchBtn.click();

        }

    }
);


/* =========================================
   SEARCH
========================================= */

searchBtn.addEventListener(
    "click",
    async () => {

        if (!currentUser) {

            alert("Please login first.");

            return;

        }


        const searchValue =
            searchInput.value.trim();


        if (!searchValue) {

            alert(
                "Enter Phone Number or Request ID"
            );

            return;

        }


        result.innerHTML = `

            <div class="loading-card">

                <div class="spinner"></div>

                <p>
                    Searching for your request...
                </p>

            </div>

        `;


        try {

            let activeSnapshot = null;
            let historySnapshot = null;


            /* =========================================
               REQUEST ID SEARCH
            ========================================= */

            if (searchValue.length === 20) {

                const requestDoc =
                    await getDoc(
                        doc(
                            db,
                            "service-request",
                            searchValue
                        )
                    );


                if (
                    requestDoc.exists()
                    &&
                    requestDoc.data().CustomerId
                        === currentUser.uid
                ) {

                    result.innerHTML =
                        buildCard(
                            requestDoc.data(),
                            requestDoc.id
                        );

                    refreshBtn.style.display =
                        "block";

                    attachRequestButtons();

                    return;

                }


                /* =========================================
                   SERVICE HISTORY
                ========================================= */

                const historyDoc =
                    await getDoc(
                        doc(
                            db,
                            "service-history",
                            searchValue
                        )
                    );


                if (
                    historyDoc.exists()
                    &&
                    historyDoc.data().CustomerId
                        === currentUser.uid
                ) {

                    result.innerHTML =
                        buildCard(
                            historyDoc.data(),
                            historyDoc.id
                        );

                    refreshBtn.style.display =
                        "block";

                    attachRequestButtons();

                    return;

                }

            }


            /* =========================================
               PHONE NUMBER SEARCH
            ========================================= */

            const activeQuery =
                query(

                    collection(
                        db,
                        "service-request"
                    ),

                    where(
                        "CustomerId",
                        "==",
                        currentUser.uid
                    ),

                    where(
                        "Phone",
                        "==",
                        searchValue
                    )

                );


            activeSnapshot =
                await getDocs(
                    activeQuery
                );


            /* =========================================
               SERVICE HISTORY
            ========================================= */

            const historyQuery =
                query(

                    collection(
                        db,
                        "service-history"
                    ),

                    where(
                        "CustomerId",
                        "==",
                        currentUser.uid
                    ),

                    where(
                        "Phone",
                        "==",
                        searchValue
                    )

                );


            historySnapshot =
                await getDocs(
                    historyQuery
                );


            /* =========================================
               NO RESULTS
            ========================================= */

            if (
                activeSnapshot.empty
                &&
                historySnapshot.empty
            ) {

                result.innerHTML = `

                    <div class="empty-state">

                        <div class="empty-icon">
                            📭
                        </div>

                        <h3>
                            No Request Found
                        </h3>

                        <p>
                            We couldn't find a request
                            matching the information
                            you entered.
                        </p>

                        <p class="hint">
                            Please check your phone
                            number or Request ID.
                        </p>

                    </div>

                `;

                refreshBtn.style.display =
                    "none";

                return;

            }


            /* =========================================
               DISPLAY RESULTS
            ========================================= */

            result.innerHTML = "";


            activeSnapshot.forEach(
                (docItem) => {

                    const data =
                        docItem.data();

                    result.innerHTML +=
                        buildCard(
                            data,
                            docItem.id
                        );

                }
            );


            historySnapshot.forEach(
                (docItem) => {

                    const data =
                        docItem.data();

                    result.innerHTML +=
                        buildCard(
                            data,
                            docItem.id
                        );

                }
            );


            refreshBtn.style.display =
                "block";


            attachRequestButtons();

        }


        catch (error) {

            console.error(
                "❌ TRACK REQUEST ERROR:",
                error
            );


            result.innerHTML = `

                <div class="result-card">

                    <h3>
                        Error
                    </h3>

                    <p>
                        Failed to retrieve request.
                    </p>

                </div>

            `;

        }

    }
);

/* =========================================
   CUSTOMER LOCATION DETAILS
========================================= */

function buildLocationDetails(data) {

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

    } else if (data.Location === "Off Campus") {

        details += line("Area", data.Area);

        details += line("Nearest Bus Stop", data.BusStop);

        details += line("Residential Address", data.Address);

        details += line("Nearest Landmark", data.Landmark);

    } else {

        // Compatibility with older requests
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
        <div class="customer-location-details">

            <h4>📍 Service Location Details</h4>

            ${details}

        </div>
    `;

}


/* =========================================
   BUILD REQUEST CARD
========================================= */

function buildCard(data, id) {

    let date = "";


    if (data.CreatedAt) {

        try {

            date =
                data.CreatedAt
                    .toDate()
                    .toLocaleString();

        }

        catch (error) {

            date = "";

        }

    }


    const isPending =
        data.Status === "Pending";


    return `

        <div
            class="result-card"
            data-request-id="${id}">

            <h3>
                ${data.Customername || ""}
            </h3>


            <div class="request-id">

                <b>
                    Request ID:
                </b>

                <span>
                    ${id}
                </span>

                <button
                    class="copy-btn"
                    data-copy-id="${id}">

                    Copy

                </button>

            </div>


            <p>
                <b>Phone:</b>
                ${data.Phone || ""}
            </p>


            
${buildLocationDetails(data)}

            <p>
                <b>Description:</b>
                ${data.Description || ""}
            </p>


            <p>
                <b>Urgency:</b>
                ${data.Urgency || ""}
            </p>


            <p>
                <b>Date Submitted:</b>
                ${date}
            </p>


            <p>
                <b>Technician:</b>
                ${data.Technician || "Not Assigned Yet"}
            </p>


            <div class="timeline">

                ${buildTimeline(
                    data.Status
                )}

            </div>


            <div
                class="status-badge
                ${getStatusClass(data.Status)}">

                ${data.Status || "Pending"}

            </div>


            ${
                isPending
                    ?

                    `

                    <div class="customer-request-actions">

                        <button
                            class="edit-request-btn"
                            data-id="${id}">

                            ✏️ Edit Request

                        </button>


                        <button
                            class="cancel-request-btn"
                            data-id="${id}">

                            ❌ Cancel Request

                        </button>

                    </div>

                    `

                    :

                    `

                    <div class="request-locked">

                        🔒 This request can no longer be modified.

                    </div>

                    `
            }

        </div>

    `;

}


/* =========================================
   ATTACH REQUEST BUTTONS
========================================= */

function attachRequestButtons() {


    /* =========================================
       COPY BUTTONS
    ========================================= */

    document
        .querySelectorAll(".copy-btn")
        .forEach(button => {

            button.onclick = () => {

                const id =
                    button.dataset.copyId;

                navigator
                    .clipboard
                    .writeText(id);

                alert(
                    "✅ Request ID copied."
                );

            };

        });


    /* =========================================
       EDIT BUTTON
    ========================================= */

    document
        .querySelectorAll(".edit-request-btn")
        .forEach(button => {

            button.onclick =
                async () => {

                    const requestId =
                        button.dataset.id;

                    await editRequest(
                        requestId
                    );

                };

        });


    /* =========================================
       CANCEL BUTTON
    ========================================= */

    document
        .querySelectorAll(".cancel-request-btn")
        .forEach(button => {

            button.onclick =
                async () => {

                    const requestId =
                        button.dataset.id;

                    await cancelRequest(
                        requestId
                    );

                };

        });

}


/* =========================================
   EDIT REQUEST
========================================= */

async function editRequest(requestId) {

    try {

        const requestRef =
            doc(
                db,
                "service-request",
                requestId
            );


        const requestSnap =
            await getDoc(requestRef);


        if (!requestSnap.exists()) {

            showErrorMessage(
                "This request no longer exists."
            );

            return;

        }


        const data =
            requestSnap.data();


        if (
            data.CustomerId !==
            currentUser.uid
        ) {

            showErrorMessage(
                "You cannot edit this request."
            );

            return;

        }


        if (
            data.Status !==
            "Pending"
        ) {

            showErrorMessage(
                "This request can no longer be edited."
            );

            return;

        }


        showEditModal(
            data,
            requestId
        );

    }

    catch (error) {

        console.error(
            "❌ EDIT REQUEST ERROR:",
            error
        );


        showErrorMessage(
            "We couldn't open the edit form."
        );

    }

}


/* =========================================
   CANCEL REQUEST
========================================= */

async function cancelRequest(requestId) {

    try {

        const requestRef =
            doc(
                db,
                "service-request",
                requestId
            );


        const requestSnap =
            await getDoc(requestRef);


        if (!requestSnap.exists()) {

            showErrorMessage(
                "This request no longer exists."
            );

            return;

        }


        const data =
            requestSnap.data();


        if (
            data.CustomerId !==
            currentUser.uid
        ) {

            showErrorMessage(
                "You cannot cancel this request."
            );

            return;

        }


        if (
            data.Status !==
            "Pending"
        ) {

            showErrorMessage(
                "This request can no longer be cancelled."
            );

            return;

        }


        showCancelModal(
            requestId
        );

    }

    catch (error) {

        console.error(
            "❌ CANCEL REQUEST ERROR:",
            error
        );


        showErrorMessage(
            "We couldn't open the cancellation option."
        );

    }

}


/* =========================================
   STATUS CLASS
========================================= */

function getStatusClass(status) {

    switch (status) {

        case "Accepted":

            return "accepted";


        case "Declined":

            return "declined";


        case "Completed":

        case "Completed ✅":

            return "completed";


        case "Cancelled":

            return "declined";


        default:

            return "pending";

    }

}


/* =========================================
   TIMELINE
========================================= */

function buildTimeline(status) {

    const steps = [

        "Pending",

        "Accepted",

        "Completed"

    ];


    let currentStatus =
        status === "Completed ✅"
            ? "Completed"
            : status;


    if (currentStatus === "Cancelled") {

        return `

            <div class="timeline-step active">

                <div class="circle"></div>

                <span>
                    Cancelled
                </span>

            </div>

        `;

    }


        let html = "";


    steps.forEach(
        (step) => {

            const active =
                steps.indexOf(step)
                <=
                steps.indexOf(currentStatus)
                    ? "active"
                    : "";


            html += `

                <div
                    class="timeline-step ${active}">

                    <div class="circle"></div>

                    <span>
                        ${step}
                    </span>

                </div>

            `;

        }
    );


    return html;

}


/* =========================================
   REFRESH
========================================= */

refreshBtn.addEventListener(
    "click",
    () => {

        searchBtn.click();

    }
);

/* =========================================
   CUSTOM MODAL SYSTEM
========================================= */

const customModal =
    document.getElementById("customModal");

const modalContent =
    document.getElementById("modalContent");

const modalClose =
    document.getElementById("modalClose");

const modalOverlay =
    document.querySelector(".modal-overlay");


function openModal(content) {

    modalContent.innerHTML = content;

    customModal.classList.add("show");

    document.body.style.overflow = "hidden";

}


function closeModal() {

    customModal.classList.remove("show");

    modalContent.innerHTML = "";

    document.body.style.overflow = "";

}


modalClose.addEventListener(
    "click",
    closeModal
);


modalOverlay.addEventListener(
    "click",
    closeModal
);


/* =========================================
   EDIT REQUEST MODAL
========================================= */

function showEditModal(data, requestId) {

    const currentPlaceType =
        data.PlaceType || data.LocationType || "";

    const schoolOptions = [

        ["SAMET", "School of Agricultural Management and Extension Technology"],
        ["SAFT", "School of Agronomy and Forestry Technology"],
        ["SAT", "School of Architectural Technology"],
        ["SFAT", "School of Food Science and Agricultural Technology"],
        ["SEET", "School of Electrical Engineering and Technology"],
        ["SET", "School of Environmental Technology"],
        ["SIT", "School of Innovative Technology"],
        ["SICT", "School of Information and Communication Technology"],
        ["SLS", "School of Life Sciences"],
        ["SPS", "School of Physical Sciences"],
        ["SSTE", "School of Science and Technology Education"],
        ["SBMS", "School of Basic Medical Sciences"],
        ["SAHS", "School of Allied Health Sciences"],
        ["USPHS", "School of Pharmaceutical Sciences"],
        ["SIPET", "School of Infrastructure, Process Engineering and Technology"],
        ["PGS", "Postgraduate School"],
        ["Other", "Other / Not Listed"]

    ];

    const schoolOptionsHTML = schoolOptions.map(
        ([code, name]) => `
            <option
                value="${code}"
                ${data.SchoolCode === code ? "selected" : ""}>
                ${name}
            </option>
        `
    ).join("");


    openModal(`

        <h2 class="edit-modal-title">
            ✏️ Edit Service Request
        </h2>

        <p class="edit-modal-subtitle">
            Update your request details while
            the request is still pending.
        </p>

        <form id="editRequestForm">

            <div class="edit-form-group">

                <label>Customer Name</label>

                <input
                    type="text"
                    id="editName"
                    value="${escapeHTML(data.Customername || "")}"
                    required>

            </div>


            <div class="edit-form-group">

                <label>Phone Number</label>

                <input
                    type="tel"
                    id="editPhone"
                    value="${escapeHTML(data.Phone || "")}"
                    required>

            </div>


            <!-- SERVICE LOCATION -->

            <h3>📍 Service Location</h3>


            <div class="edit-form-group">

                <label>Location Type</label>

                <select id="editLocation" required>

                    <option value="">
                        Select Location
                    </option>

                    <option
                        value="On Campus"
                        ${data.Location === "On Campus" ? "selected" : ""}>
                        On Campus
                    </option>

                    <option
                        value="Off Campus"
                        ${data.Location === "Off Campus" ? "selected" : ""}>
                        Off Campus
                    </option>

                </select>

            </div>


            <!-- ON CAMPUS -->

            <div
                class="edit-form-group"
                id="editCampusGroup">

                <label>Campus</label>

                <select id="editCampus">

                    <option value="">
                        Select Campus
                    </option>

                    <option
                        value="Bosso Campus"
                        ${data.Campus === "Bosso Campus" ? "selected" : ""}>
                        Bosso Campus
                    </option>

                    <option
                        value="Gidan-Kwano Campus"
                        ${data.Campus === "Gidan-Kwano Campus" ? "selected" : ""}>
                        Gidan-Kwano Campus
                    </option>

                </select>

            </div>


            <div
                class="edit-form-group"
                id="editPlaceTypeGroup">

                <label>Location Category</label>

                <select id="editPlaceType">

                    <option value="">
                        Select Category
                    </option>

                    <option
                        value="Hostel"
                        ${currentPlaceType === "Hostel" ? "selected" : ""}>
                        Hostel
                    </option>

                    <option
                        value="School"
                        ${currentPlaceType === "School" ? "selected" : ""}>
                        School
                    </option>

                    <option
                        value="Lecture Hall"
                        ${currentPlaceType === "Lecture Hall" ? "selected" : ""}>
                        Lecture Hall
                    </option>

                    <option
                        value="Other"
                        ${currentPlaceType === "Other" ? "selected" : ""}>
                        Other
                    </option>

                </select>

            </div>


            <div
                class="edit-form-group"
                id="editSchoolGroup">

                <label>School</label>

                <select id="editSchool">

                    <option value="">
                        Select School
                    </option>

                    ${schoolOptionsHTML}

                </select>

            </div>


            <div
                class="edit-form-group"
                id="editSpecificLocationGroup">

                <label>Building / Specific Location</label>

                <input
                    type="text"
                    id="editSpecificLocation"
                    value="${escapeHTML(data.Building || data.SpecificLocation || "")}"
                    placeholder="Enter building or location">

            </div>


            <div
                class="edit-form-group"
                id="editBlockGroup">

                <label>Block</label>

                <input
                    type="text"
                    id="editBlock"
                    value="${escapeHTML(data.Block || "")}">

            </div>


            <div
                class="edit-form-group"
                id="editRoomGroup">

                <label>Room Number</label>

                <input
                    type="text"
                    id="editRoom"
                    value="${escapeHTML(data.Room || "")}">

            </div>


            <!-- OFF CAMPUS -->

            <div
                class="edit-form-group"
                id="editAreaGroup">

                <label>Area</label>

                <input
                    type="text"
                    id="editArea"
                    value="${escapeHTML(data.Area || "")}">

            </div>


            <div
                class="edit-form-group"
                id="editBusStopGroup">

                <label>Nearest Bus Stop</label>

                <input
                    type="text"
                    id="editBusStop"
                    value="${escapeHTML(data.BusStop || "")}">

            </div>


            <div
                class="edit-form-group"
                id="editAddressGroup">

                <label>Residential Address</label>

                <input
                    type="text"
                    id="editAddress"
                    value="${escapeHTML(data.Address || "")}">

            </div>


            <div
                class="edit-form-group"
                id="editLandmarkGroup">

                <label>Nearest Landmark</label>

                <input
                    type="text"
                    id="editLandmark"
                    value="${escapeHTML(data.Landmark || "")}">

            </div>


            <div
                class="edit-form-group"
                id="editDirectionsGroup">

                <label>Additional Directions</label>

                <textarea
                    id="editDirections"
                    placeholder="Add directions to help the technician find you">${escapeHTML(data.Directions || "")}</textarea>

            </div>


            <!-- DESCRIPTION -->

            <div class="edit-form-group">

                <label>Description</label>

                <textarea
                    id="editDescription"
                    required>${escapeHTML(data.Description || "")}</textarea>

            </div>


            <!-- URGENCY -->

            <div class="edit-form-group">

                <label>Urgency</label>

                <select id="editUrgency">

                    <option value="Low"
                        ${data.Urgency === "Low" ? "selected" : ""}>
                        Low
                    </option>

                    <option value="Medium"
                        ${data.Urgency === "Medium" ? "selected" : ""}>
                        Medium
                    </option>

                    <option value="High"
                        ${data.Urgency === "High" ? "selected" : ""}>
                        High
                    </option>

                </select>

            </div>


            <div class="modal-actions">

                <button
                    type="button"
                    class="modal-btn modal-cancel-btn"
                    id="editCancelBtn">
                    Cancel
                </button>

                <button
                    type="submit"
                    class="modal-btn modal-save-btn"
                    id="saveEditBtn">
                    💾 Save Changes
                </button>

            </div>

        </form>

    `);


    /* =========================================
       LOCATION FIELD VISIBILITY
    ========================================= */

    const getEditField = id =>
        document.getElementById(id);

    const locationSelect =
        getEditField("editLocation");

    const placeTypeSelect =
        getEditField("editPlaceType");


    function updateEditLocationFields() {

        const onCampus =
            locationSelect.value === "On Campus";

        const offCampus =
            locationSelect.value === "Off Campus";

        const isSchool =
            onCampus && placeTypeSelect.value === "School";

        const isHostel =
            onCampus && placeTypeSelect.value === "Hostel";


        const visibility = {

            editCampusGroup: onCampus,

            editPlaceTypeGroup: onCampus,

            editSchoolGroup: isSchool,

            editSpecificLocationGroup: onCampus,

            editBlockGroup: isHostel,

            editRoomGroup: isHostel,

            editAreaGroup: offCampus,

            editBusStopGroup: offCampus,

            editAddressGroup: offCampus,

            editLandmarkGroup: offCampus,

            editDirectionsGroup: onCampus || offCampus

        };


        Object.entries(visibility).forEach(
            ([id, visible]) => {

                getEditField(id).style.display =
                    visible ? "" : "none";

            }
        );


        getEditField("editCampus").required =
            onCampus;

        placeTypeSelect.required =
            onCampus;

        getEditField("editSchool").required =
            isSchool;

    }


    locationSelect.addEventListener(
        "change",
        updateEditLocationFields
    );

    placeTypeSelect.addEventListener(
        "change",
        updateEditLocationFields
    );

    updateEditLocationFields();


    /* =========================================
       CANCEL EDIT
    ========================================= */

    getEditField("editCancelBtn").onclick =
        closeModal;


    /* =========================================
       SAVE EDIT
    ========================================= */

    getEditField("editRequestForm").addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();

            const saveBtn =
                getEditField("saveEditBtn");

            saveBtn.disabled = true;

            saveBtn.textContent = "Saving...";


            try {

                const requestRef = doc(
                    db,
                    "service-request",
                    requestId
                );


                // Recheck ownership and status before saving.
                const latestSnap =
                    await getDoc(requestRef);


                if (!latestSnap.exists()) {

                    throw new Error(
                        "This request no longer exists."
                    );

                }


                const latestData =
                    latestSnap.data();


                if (
                    latestData.CustomerId !== currentUser.uid
                    ||
                    latestData.Status !== "Pending"
                ) {

                    throw new Error(
                        "This request can no longer be edited."
                    );

                }


                const location =
                    locationSelect.value;

                const placeType =
                    placeTypeSelect.value;


                const schoolSelect =
                    getEditField("editSchool");

                const schoolCode =
                    location === "On Campus" && placeType === "School"
                        ? schoolSelect.value
                        : "";

                const schoolName =
                    schoolCode
                        ? schoolSelect.options[
                            schoolSelect.selectedIndex
                        ].textContent.trim()
                        : "";


                const specificLocation =
                    location === "On Campus"
                        ? getEditField("editSpecificLocation").value.trim()
                        : "";


                await updateDoc(
                    requestRef,
                    {

                        Customername:
                            getEditField("editName").value.trim(),

                        Phone:
                            getEditField("editPhone").value.trim(),

                        Location: location,

                        Campus:
                            location === "On Campus"
                                ? getEditField("editCampus").value
                                : "",

                        PlaceType:
                            location === "On Campus"
                                ? placeType
                                : "",

                        LocationType:
                            location === "On Campus"
                                ? placeType
                                : "",

                        School: schoolName,

                        SchoolCode: schoolCode,

                        SpecificLocation: specificLocation,

                        Building: specificLocation,

                        Block:
                            location === "On Campus" && placeType === "Hostel"
                                ? getEditField("editBlock").value.trim()
                                : "",

                        Room:
                            location === "On Campus" && placeType === "Hostel"
                                ? getEditField("editRoom").value.trim()
                                : "",

                        Area:
                            location === "Off Campus"
                                ? getEditField("editArea").value.trim()
                                : "",

                        BusStop:
                            location === "Off Campus"
                                ? getEditField("editBusStop").value.trim()
                                : "",

                        Address:
                            location === "Off Campus"
                                ? getEditField("editAddress").value.trim()
                                : "",

                        Landmark:
                            location === "Off Campus"
                                ? getEditField("editLandmark").value.trim()
                                : "",

                        Directions:
                            getEditField("editDirections").value.trim(),

                        Description:
                            getEditField("editDescription").value.trim(),

                        Urgency:
                            getEditField("editUrgency").value

                    }
                );


                closeModal();

                showSuccessMessage(
                    "Request updated successfully.",
                    "✏️"
                );

                searchBtn.click();

            }

            catch (error) {

                console.error(
                    "❌ EDIT REQUEST ERROR:",
                    error
                );

                saveBtn.disabled = false;

                saveBtn.textContent =
                    "💾 Save Changes";

                showErrorMessage(
                    error.message ||
                    "We couldn't update your request. Please try again."
                );

            }

        }
    );

}
/* =========================================
CONFIRM CANCEL MODAL
========================================= */

function showCancelModal(requestId) {

openModal(`  

    <div class="confirm-icon">  
        ❌  
    </div>  


    <h2 class="confirm-title">  
        Cancel Request?  
    </h2>  


    <p class="confirm-message">  

        Are you sure you want to cancel  
        this service request?  

        <br><br>  

        This action cannot be undone.  

    </p>  


    <div class="modal-actions">  

        <button  
            type="button"  
            class="modal-btn modal-cancel-btn"  
            id="keepRequestBtn">  

            Keep Request  

        </button>  


        <button  
            type="button"  
            class="modal-btn danger-btn"  
            id="confirmCancelBtn">  

            ❌ Cancel Request  

        </button>  

    </div>  

`);  


document  
    .getElementById("keepRequestBtn")  
    .onclick = closeModal;  


document  
    .getElementById("confirmCancelBtn")  
    .onclick =  
    async () => {  

        const button =  
            document.getElementById(  
                "confirmCancelBtn"  
            );  


        button.disabled = true;  

        button.textContent =  
            "Cancelling...";  


        try {  

            const requestRef =  
                doc(  
                    db,  
                    "service-request",  
                    requestId  
                );  
                  
                await updateDoc(  
requestRef,  
{  
    Status: "Cancelled",  
    CancelledAt: serverTimestamp()  
}

);

closeModal();  


            showSuccessMessage(  
                "Your request has been cancelled.",  
                "❌"  
            );  


            searchBtn.click();  

        }  

        catch (error) {  

            console.error(  
                "❌ CANCEL REQUEST ERROR:",  
                error  
            );  


            button.disabled = false;  

            button.textContent =  
                "❌ Cancel Request";  


            showErrorMessage(  
                "We couldn't cancel your request. Please try again."  
            );  

        }  

    };

}

/* =========================================
SUCCESS MESSAGE
========================================= */

function showSuccessMessage(
message,
icon = "✅"
) {

openModal(`  

    <div class="confirm-icon">  
        ${icon}  
    </div>  


    <h2 class="confirm-title">  
        Done  
    </h2>  


    <p class="confirm-message">  
        ${message}  
    </p>  


    <button  
        type="button"  
        class="modal-btn modal-save-btn"  
        id="successOkBtn">  

        OK  

    </button>  

`);  


document  
    .getElementById("successOkBtn")  
    .onclick = closeModal;

}

/* =========================================
ERROR MESSAGE
========================================= */

function showErrorMessage(message) {

openModal(`  

    <div class="confirm-icon">  
        ⚠️  
    </div>  


    <h2 class="confirm-title">  
        Something went wrong  
    </h2>  


    <p class="confirm-message">  
        ${message}  
    </p>  


    <button  
        type="button"  
        class="modal-btn danger-btn"  
        id="errorOkBtn">  

        OK  

    </button>  

`);  


document  
    .getElementById("errorOkBtn")  
    .onclick = closeModal;

}

/* =========================================
ESCAPE HTML
========================================= */

function escapeHTML(value) {

return String(value)  
    .replace(/&/g, "&amp;")  
    .replace(/</g, "&lt;")  
    .replace(/>/g, "&gt;")  
    .replace(/"/g, "&quot;")  
    .replace(/'/g, "&#039;");

}


     