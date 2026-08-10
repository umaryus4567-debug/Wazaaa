import { auth, db } from "./firebase-config.js";

import {
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc
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

            /*
            =========================================
            REQUEST ID SEARCH
            =========================================
            */

            /*
             A Firestore auto-generated document ID
             is normally 20 characters long.

             If the user enters a 20-character value,
             treat it as a possible Request ID.
            */

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

                    return;

                }

                /*
                Check service history using the
                request ID as the document ID.
                */

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

                    return;

                }

            }


            /*
            =========================================
            PHONE NUMBER SEARCH
            =========================================
            */

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


            /*
            =========================================
            SERVICE HISTORY
            =========================================
            */

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


            /*
            =========================================
            NO RESULTS
            =========================================
            */

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

                return;

            }


            /*
            =========================================
            DISPLAY RESULTS
            =========================================
            */

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


    return `

        <div class="result-card">

            <h3>
                ${data.Customername || ""}
            </h3>


            <div class="request-id">

                <b>
                    Request ID:
                </b>

                <span id="req-${id}">
                    ${id}
                </span>

                <button
                    class="copy-btn"
                    onclick="copyRequestID('${id}')">

                    Copy

                </button>

            </div>


            <p>

                <b>Phone:</b>

                ${data.Phone || ""}

            </p>


            <p>

                <b>Location:</b>

                ${data.Location || ""}

            </p>


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

        </div>

    `;

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
   COPY REQUEST ID
========================================= */

window.copyRequestID =
    function(id) {

        navigator
            .clipboard
            .writeText(id);

        alert(
            "✅ Request ID copied."
        );

    };


/* =========================================
   REFRESH
========================================= */

refreshBtn.addEventListener(
    "click",
    () => {

        searchBtn.click();

    }
);