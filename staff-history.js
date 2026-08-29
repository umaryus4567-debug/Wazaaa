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


        card.className =
            "history-card";


        card.innerHTML = `

            <h3>
                ${data.Customername || ""}
            </h3>


            <p>
                <b>Phone:</b>
                ${data.Phone || ""}
            </p>


            <p>
                <b>Location:</b>
                ${data.Location || ""}
            </p>


            <p>
                <b>Area:</b>
                ${data.Area || ""}
            </p>


            <p>
                <b>Address:</b>
                ${data.Address || ""}
            </p>


            <p>
                <b>Description:</b>
                ${data.Description || ""}
            </p>


            <p>
                <b>Urgency:</b>
                ${data.Urgency || ""}
            </p>


            <p class="tech">
                👨‍🔧 Technician:
                ${data.Technician || "Not Assigned"}
            </p>


            <p class="status">
                ✅ Completed
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

                    (request.Address || "")
                    .toLowerCase()
                    .includes(keyword)

                    ||

                    (request.Description || "")
                    .toLowerCase()
                    .includes(keyword)

                    ||

                    (request.Technician || "")
                    .toLowerCase()
                    .includes(keyword)

                );

            });


        renderHistory(filtered);

    }

);