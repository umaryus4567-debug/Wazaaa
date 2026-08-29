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
        "declinedContainer"
    );

const searchInput =
    document.getElementById(
        "searchInput"
    );

const declinedCount =
    document.getElementById(
        "declinedCount"
    );


/*==================================
DATA
==================================*/

let declinedRequests = [];


/*==================================
AUTHENTICATION
==================================*/

onAuthStateChanged(
    auth,
    (user) => {

        if (!user) {

            

            return;

        }

        

        loadDeclinedRequests();

    }
);


/*==================================
LOAD DECLINED REQUESTS
==================================*/

function loadDeclinedRequests(){

    const declinedQuery =
        query(

            collection(
                db,
                "service-request"
            ),

            where(
                "Status",
                "==",
                "Declined"
            )

        );


    onSnapshot(

        declinedQuery,

        (snapshot) => {

            declinedRequests = [];


            snapshot.forEach(
                (documentItem) => {

                    declinedRequests.push({

                        id:
                            documentItem.id,

                        ...documentItem.data()

                    });

                }
            );


            /*==================================
            SORT NEWEST DECLINED FIRST
            ==================================*/

            declinedRequests.sort(
                (a, b) => {

                    const dateA =
                        a.DeclinedAt?.toMillis?.() || 0;

                    const dateB =
                        b.DeclinedAt?.toMillis?.() || 0;

                    return dateB - dateA;

                }
            );


            /*==================================
            UPDATE COUNTER
            ==================================*/

            declinedCount.textContent =
                declinedRequests.length;


            


            renderDeclinedRequests(
                declinedRequests
            );

        },

        (error) => {

            console.error(
                "❌ Declined Requests Error:",
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

function renderDeclinedRequests(
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
                    No Declined Requests
                </h2>

                <p>
                    There are currently no
                    staff-declined requests.
                </p>

            </div>

        `;

        return;

    }


    requests.forEach(
        (data) => {

            container.innerHTML +=
                buildDeclinedCard(
                    data
                );

        }
    );

}


/*==================================
BUILD CARD
==================================*/

function buildDeclinedCard(data){

    let date = "Unknown";

    let declinedDate = "Unknown";


    /*==================================
    DATE SUBMITTED
    ==================================*/

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


    /*==================================
    DATE DECLINED
    ==================================*/

    if (data.DeclinedAt) {

        try {

            declinedDate =
                data.DeclinedAt
                    .toDate()
                    .toLocaleString();

        }

        catch(error){

            declinedDate = "Unknown";

        }

    }


    return `

        <div
            class="declined-card">


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

                <b>Declined At:</b>

                ${declinedDate}

            </p>


            <span class="declined-badge">

                🚫 Declined

            </span>


            <div class="declined-info">

                <b>
                    Staff declined this request.
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
            declinedRequests.filter(
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


        renderDeclinedRequests(
            filtered
        );

    }
);


/*==================================
ESCAPE HTML
==================================*/

function escapeHTML(value){

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}