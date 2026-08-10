import { auth, db } from "./firebase-config.js";

import {
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";


const historyList =
    document.getElementById("historyList");


/* =========================================
   CHECK CUSTOMER AUTHENTICATION
========================================= */

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.replace("login.html");

        return;
    }

    console.log(
        "✅ Customer authenticated:",
        user.uid
    );

    await loadHistory(user.uid);

});


/* =========================================
   LOAD CUSTOMER HISTORY
========================================= */

async function loadHistory(uid) {

    historyList.innerHTML =
        "<p>Loading...</p>";

    try {

        const q = query(

            collection(
                db,
                "service-history"
            ),

            where(
                "CustomerId",
                "==",
                uid
            )

        );


        const snapshot =
            await getDocs(q);


        historyList.innerHTML = "";


        if (snapshot.empty) {

            historyList.innerHTML = `

                <div class="empty">

                    No completed service requests yet.

                </div>

            `;

            return;
        }


        snapshot.forEach((doc) => {

            const data =
                doc.data();


            historyList.innerHTML += `

                <div class="history-card">

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

                </div>

            `;

        });


    }

    catch (error) {

        console.error(
            "❌ HISTORY ERROR:",
            error
        );


        historyList.innerHTML = `

            <div class="empty">

                Failed to load history.

            </div>

        `;

    }

}