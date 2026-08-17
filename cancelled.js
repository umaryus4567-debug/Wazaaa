import { auth, db } from "./firebase-config.js";

import {
    collection,
    query,
    where,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
    protectStaffPage
} from "./auth-utils.js";


/*==================================
PROTECT STAFF PAGE
==================================*/

protectStaffPage();


/*==================================
ELEMENTS
==================================*/

const container =
    document.getElementById(
        "cancelledContainer"
    );

const searchInput =
    document.getElementById(
        "searchInput"
    );

const cancelledCount =
    document.getElementById(
        "cancelledCount"
    );


/*==================================
DATA
==================================*/

let cancelledRequests = [];


/*==================================
AUTHENTICATION
==================================*/

onAuthStateChanged(
    auth,
    (user) => {

        if (!user) {

            console.log(
                "❌ Staff authentication required."
            );

            return;

        }

        console.log(
            "✅ Cancelled Requests page authenticated:",
            user.uid
        );

        loadCancelledRequests();

    }
);


/*==================================
LOAD CANCELLED REQUESTS
==================================*/

function loadCancelledRequests(){

    const cancelledQuery =
        query(

            collection(
                db,
                "service-request"
            ),

            where(
                "Status",
                "==",
                "Cancelled"
            )

        );


    onSnapshot(

        cancelledQuery,

        (snapshot) => {

            cancelledRequests = [];


            snapshot.forEach(
                (documentItem) => {

                    cancelledRequests.push({

                        id:
                            documentItem.id,

                        ...documentItem.data()

                    });

                }
            );


            /*
            ==================================
            SORT NEWEST FIRST
            ==================================
            */

            cancelledRequests.sort(
                (a, b) => {

                    const dateA =
    a.CancelledAt?.toMillis?.() || 0;

const dateB =
    b.CancelledAt?.toMillis?.() || 0;

                    return dateB - dateA;

                }
            );


            cancelledCount.textContent =
                cancelledRequests.length;


            console.log(
                "🚫 CANCELLED REQUESTS:",
                cancelledRequests
            );


            renderCancelledRequests(
                cancelledRequests
            );

        },

        (error) => {

            console.error(
                "❌ Cancelled Requests Error:",
                error
            );


            container.innerHTML = `

                <div class="empty-state">

                    <div class="icon">
                        ⚠️
                    </div>

                    <h2>
                        Unable to Load Requests
                    </h2>

                    <p>
                        Please refresh the page
                        and try again.
                    </p>

                </div>

            `;

        }

    );

}


/*==================================
RENDER REQUESTS
==================================*/

function renderCancelledRequests(
    requests
){

    container.innerHTML = "";


    if (!requests.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="icon">
                    📭
                </div>

                <h2>
                    No Cancelled Requests
                </h2>

                <p>
                    There are currently no
                    customer-cancelled requests.
                </p>

            </div>

        `;

        return;

    }


    requests.forEach(
        (data) => {

            container.innerHTML +=
                buildCancelledCard(
                    data
                );

        }
    );

}


/*==================================
BUILD CARD
==================================*/

/*==================================
BUILD CARD
==================================*/

function buildCancelledCard(data){

    let date = "Unknown";

    let cancelledDate = "Unknown";


    /*
    =========================================
    DATE SUBMITTED
    =========================================
    */

    if (data.CreatedAt) {

        try {

            date =
                data.CreatedAt
                    .toDate()
                    .toLocaleString();

        }

        catch(error){

            date = "Unknown";

        }

    }


    /*
    =========================================
    DATE CANCELLED
    =========================================
    */

    if (data.CancelledAt) {

        try {

            cancelledDate =
                data.CancelledAt
                    .toDate()
                    .toLocaleString();

        }

        catch(error){

            cancelledDate = "Unknown";

        }

    }


    /*
    =========================================
    REQUEST CARD
    =========================================
    */

    return `

        <div
            class="cancelled-card">

            <h2>

                ${escapeHTML(
                    data.Customername || "Customer"
                )}

            </h2>


            <div class="request-id">

                <b>
                    Request ID:
                </b>

                ${escapeHTML(
                    data.id || ""
                )}

            </div>


            <p>

                <b>Phone:</b>

                ${escapeHTML(
                    data.Phone || ""
                )}

            </p>


            <p>

                <b>Location:</b>

                ${escapeHTML(
                    data.Location || ""
                )}

            </p>


            <p>

                <b>Area:</b>

                ${escapeHTML(
                    data.Area || ""
                )}

            </p>


            <p>

                <b>Bus Stop:</b>

                ${escapeHTML(
                    data.BusStop || ""
                )}

            </p>


            <p>

                <b>Residential Address:</b>

                ${escapeHTML(
                    data.Address || ""
                )}

            </p>


            <p>

                <b>Description:</b>

                ${escapeHTML(
                    data.Description || ""
                )}

            </p>


            <p>

                <b>Urgency:</b>

                ${escapeHTML(
                    data.Urgency || ""
                )}

            </p>


            <p>

                <b>Date Submitted:</b>

                ${date}

            </p>


            <p>

                <b>Cancelled At:</b>

                ${cancelledDate}

            </p>


            <span class="cancelled-badge">

                🚫 Cancelled

            </span>


            <div class="cancelled-info">

                <b>
                    Customer cancelled this request.
                </b>

                <br>

                This request is no longer
                available for acceptance,
                assignment, or modification.

            </div>


        </div>

    `;

}


/*==================================
SEARCH
==================================*/

searchInput.addEventListener(
    "input",
    () => {

        const keyword =
            searchInput.value
                .toLowerCase()
                .trim();


        const filtered =
            cancelledRequests.filter(
                (request) => {

                    return (

                        (request.Customername || "")
                            .toLowerCase()
                            .includes(keyword)

                        ||

                        (request.Phone || "")
                            .toLowerCase()
                            .includes(keyword)

                        ||

                        (request.Location || "")
                            .toLowerCase()
                            .includes(keyword)

                        ||

                        (request.Description || "")
                            .toLowerCase()
                            .includes(keyword)

                        ||

                        (request.id || "")
                            .toLowerCase()
                            .includes(keyword)

                    );

                }
            );


        renderCancelledRequests(
            filtered
        );

    }
);


/*==================================
ESCAPE HTML
==================================*/

function escapeHTML(value){

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}