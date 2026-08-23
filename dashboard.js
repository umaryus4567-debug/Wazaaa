import { auth, db } from "./firebase-config.js";

import { onAuthStateChanged }
from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
    protectStaffPage
} from "./auth-utils.js";

protectStaffPage();
let allRequests = [];
let technicians = [];
import {
    collection,
    onSnapshot,
    doc,
    updateDoc,
    deleteDoc,
    getDocs,
    getDoc,
    setDoc,
    serverTimestamp,
    increment,
    runTransaction
}
from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import {
    createNotification
} from "./notification-utils.js";

async function loadTechnicians(){

    const snapshot = await getDocs(
        collection(db,"technicians")
    );

    technicians = [];

    snapshot.forEach(doc => {

        console.log(doc.data());

        technicians.push({
            name: doc.data().Name,
            phone: doc.data().Phone
        });

    });

    console.log("Technicians Array:", technicians);
}

const container =
document.getElementById("requestsContainer");

const searchInput =
document.getElementById("searchInput");


/* ==========================
   LOAD REQUESTS
========================== */
await loadTechnicians();

onSnapshot(
    collection(db, "service-request"),

    (snapshot) => {

        allRequests = [];

        let total = 0;
        let pending = 0;
        let accepted = 0;
        let declined = 0;
        let completed = 0;

snapshot.forEach((documentItem) => {

    const data = documentItem.data();


    /*==================================
      COUNT ALL NON-CANCELLED REQUESTS
    ==================================*/

    if (data.Status !== "Cancelled") {

        total++;

    }


    /*==================================
      COUNT STATUS VALUES
    ==================================*/

    if (data.Status === "Pending") {

        pending++;

    }


    if (data.Status === "Accepted") {

        accepted++;

    }


    if (data.Status === "Declined") {

        declined++;

    }


    if (data.Status === "Completed ✅") {

        completed++;

    }


    /*==================================
      ACTIVE DASHBOARD REQUESTS
      ----------------------------------
      Declined and Cancelled requests
      are NOT added to allRequests.
    ==================================*/

    if (
        data.Status !== "Cancelled" &&
        data.Status !== "Declined"
    ) {

        allRequests.push({

            id: documentItem.id,

            ...data

        });

    }

});


        /*
        =========================================
        UPDATE STAT COUNTERS
        =========================================
        */

        document.getElementById(
            "totalCount"
        ).textContent = total;


        document.getElementById(
            "pendingCount"
        ).textContent = pending;


        document.getElementById(
            "acceptedCount"
        ).textContent = accepted;


        document.getElementById(
            "declinedCount"
        ).textContent = declined;


        document.getElementById(
            "completedCount"
        ).textContent = completed;


        console.log(
            "📦 ACTIVE SERVICE REQUESTS:",
            allRequests
        );


        /*
        =========================================
        RENDER ONLY ACTIVE REQUESTS
        =========================================
        */

        renderRequests(allRequests);

    },


    (error) => {

        console.error(
            "❌ Service Request Listener Error:",
            error
        );

    }
);

console.log("Technicians Array:", technicians);

/*==================================
UPDATE WEBSITE STATISTICS
==================================*/

async function updateWebsiteStatistics() {

    try {

        const statsRef =
            doc(
                db,
                "site-stats",
                "overview"
            );

        const statsSnap =
            await getDoc(statsRef);

        if (!statsSnap.exists()) {

            await setDoc(
                statsRef,
                {
                    completedRequests: 0,
                    satisfiedClients: 0,
                    declinedRequests: 0,
                    successRate: 0
                }
            );

        }

        const updatedSnap =
            await getDoc(statsRef);

        const stats =
            updatedSnap.data();

        const completed =
            Number(
                stats.completedRequests || 0
            );

        const declined =
            Number(
                stats.declinedRequests || 0
            );

        const totalFinal =
            completed + declined;

        const successRate =
            totalFinal > 0
                ? Math.round(
                    (completed / totalFinal) * 100
                )
                : 0;

        await updateDoc(
            statsRef,
            {
                successRate: successRate
            }
        );

        console.log(
            "📊 Website statistics updated:",
            {
                completedRequests:
                    completed,

                satisfiedClients:
                    stats.satisfiedClients,

                declinedRequests:
                    declined,

                successRate:
                    successRate
            }
        );

    }

    catch (error) {

        console.error(
            "❌ Website statistics update error:",
            error
        );

    }

}
/* ==========================
   RENDER REQUESTS
========================== */

function renderRequests(requests){

    /*
    =========================================
    NEVER DISPLAY CANCELLED REQUESTS
    =========================================
    */

    requests = requests.filter(
        request =>
            request.Status !== "Cancelled"
    );


    container.innerHTML = "";

    requests.forEach((data) => {

        const card =
        document.createElement("div");

        card.className =
        "request-card";

card.innerHTML = `

<h3>${data.Customername || ""}</h3>

<p><b>Phone:</b> ${data.Phone || ""}</p>

<p><b>Location:</b> ${data.Location || ""}</p>

<p><b>Description:</b> ${data.Description || ""}</p>

<p><b>Urgency:</b> ${data.Urgency || ""}</p>

<label class="technician-label">
Assign Technician
</label>

<select
class="technician-select"
data-id="${data.id}">

<option value="">
Select Technician
</option>

${technicians.map(tech => `
<option
value="${tech.name}"
data-phone="${tech.phone}"
${data.Technician === tech.name ? "selected" : ""}>
${tech.name}
</option>
`).join("")}

</select>

<p class="tech-badge">
👷 ${data.Technician || "Not Assigned"}
</p>

<p>
📞 ${data.TechnicianPhone || "No phone assigned"}
</p>

<p class="status"
style="color:${getStatusColor(data.Status)}">

Status:
${data.Status || "Pending"}

</p>

<button
class="accept"
data-id="${data.id}">
Accept
</button>

<button
class="decline"
data-id="${data.id}">
Decline
</button>

<button
class="complete"
data-id="${data.id}">
Complete
</button>


<button
class="whatsapp"
data-phone="${data.Phone || ''}"
data-name="${data.Customername || ''}">
WhatsApp
</button>

${data.Status === "Completed ✅" ? `

<button
class="Archive"
data-id="${data.id}">
📦 Archive
</button>

` : ""}

`;

container.appendChild(card);
    });

    addButtonEvents();
}

/* ==========================
   SEARCH BAR
========================== */

searchInput.addEventListener(
    "input",
    () => {

        const keyword =
        searchInput.value
        .toLowerCase()
        .trim();

        const filtered =
        allRequests.filter((request) => {

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

                (request.Status || "")
                .toLowerCase()
                .includes(keyword)
            );
        });

        renderRequests(filtered);
    }
);

/* ==========================
   BUTTON EVENTS
========================== */

function addButtonEvents(){

    document
    .querySelectorAll(".accept")
    .forEach(btn => {

        btn.onclick = async () => {

     const requestId = btn.dataset.id;

const requestRef = doc(
    db,
    "service-request",
    requestId
);

const requestSnap = await getDoc(requestRef);

if (!requestSnap.exists()) {

    alert("Request not found.");

    return;

}

const requestData = requestSnap.data();

if (requestData.Status === "Cancelled") {

    alert(
        "This request was cancelled by the customer and can no longer be modified."
    );

    return;

}

await updateDoc(
    requestRef,
    {
        Status: "Accepted"
    }
);


/*==================================
CUSTOMER NOTIFICATION
==================================*/

await createNotification({

    uid: requestData.CustomerId,

    requestId: requestId,

    title: "Request Declined",

    message:
        "Your electrical service request has been reviewed and unfortunately could not be accepted at this time.",

    type: "request_declined",

    icon: "fa-circle-xmark",

    sender: "staff",

    link: ""

});
        };
    });
    
document
.querySelectorAll(".Archive")
.forEach(button => {

    button.onclick = async () => {

        const id = button.dataset.id;

        try {

            const requestRef =
                doc(
                    db,
                    "service-request",
                    id
                );


            const requestSnap =
                await getDoc(requestRef);


            if (!requestSnap.exists()) {

                alert(
                    "Request not found."
                );

                return;

            }


            const requestData =
                requestSnap.data();


            /*==================================
            SAVE TO SERVICE HISTORY
            ==================================*/

            const historyRef =
                doc(
                    db,
                    "service-history",
                    id
                );


            await setDoc(
                historyRef,
                {
                    ...requestData,

                    Status: "Completed ✅",
    
    ArchivedAt:
    serverTimestamp()
                }
            );
            
            /*==================================
UPDATE PUBLIC STATISTICS
==================================*/

await updateDoc(
    doc(
        db,
        "site-stats",
        "overview"
    ),
    {
        completedRequests:
            increment(1),

        satisfiedClients:
            increment(1)
    }
);

await updateWebsiteStatistics();
            
            /*==================================
UPDATE PUBLIC COMPLETED STATISTICS
==================================*/

const statsRef = doc(
    db,
    "site-stats",
    "overview"
);

await setDoc(
    statsRef,
    {
        completedRequests: increment(1)
    },
    {
        merge: true
    }
);

console.log(
    "✅ Completed request statistic updated."
);


            console.log(
                "✅ Request saved to service-history:",
                id
            );


            /*==================================
            REMOVE FROM ACTIVE REQUESTS
            ==================================*/

            await deleteDoc(
                requestRef
            );
            console.log(
    "✅ Request removed from service-request:",
    id
);


            alert(
                "Request archived successfully ✅"
            );


        }

        catch (error) {

            console.error(
                "❌ Archive Error:",
                error
            );


            alert(
                "Failed to archive request. Check the console."
            );

        }

    };

});


document
.querySelectorAll(".delete")
.forEach(btn => {

    btn.onclick = async () => {

        const requestId =
        btn.dataset.id;

        const confirmDelete =
        confirm(
            "Delete this completed request?"
        );

        if(!confirmDelete) return;

        await deleteDoc(
            doc(
                db,
                "service-request",
                requestId
            )
        );

        alert(
            "Request deleted successfully"
        );

    };

});

document
.querySelectorAll(".technician-select")
.forEach(select => {

    select.addEventListener("change", async () => {

        const technician = select.value;

        if (!technician) return;

        const technicianPhone =
            select.options[select.selectedIndex]
            .getAttribute("data-phone") || "";

        const requestId = select.dataset.id;

        console.log("Technician:", technician);
        console.log("Phone:", technicianPhone);

        await updateDoc(
            doc(db, "service-request", requestId),
            {
                Technician: technician,
                TechnicianPhone: technicianPhone,
                Status: "Accepted"
            }
        );

        const card =
            select.closest(".request-card");

        const customerPhone =
            card.querySelector(".whatsapp").dataset.phone;

        const customerName =
            card.querySelector(".whatsapp").dataset.name;

        let formattedPhone =
            customerPhone.replace(/\D/g, "");

        if(formattedPhone.startsWith("0")){
            formattedPhone =
                "234" + formattedPhone.substring(1);
        }

        const message =
`Hello ${customerName},

✅ Your electrical service request has been assigned.

👷 Technician:
${technician}

📞 Technician Phone:
${technicianPhone}

The technician will contact you shortly.

Thank you for choosing UY Power Solutions.

UY Power Solutions Support Team`;

        window.open(
            `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`,
            "_blank"
        );

    });

});
document
.querySelectorAll(".whatsapp")
.forEach(btn => {

    btn.onclick = () => {

        let phone =
        btn.dataset.phone;

        let name =
        btn.dataset.name;

        if(!phone){
            alert("No phone number found");
            return;
        }

        phone =
        phone.replace(/\D/g, "");

        if(phone.startsWith("0")){
            phone =
            "234" + phone.substring(1);
        }

        const message =
`Hello ${name},

Thank you for contacting our electrical service team.

Your request has been received and is currently under review.

We will contact you shortly.

Regards,
Service Team`;

        const whatsappURL =
        `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

        window.open(
            whatsappURL,
            "_blank"
        );

    };

});

    document
    .querySelectorAll(".decline")
    .forEach(btn => {

        btn.onclick = async () => {

        const requestId = btn.dataset.id;

const requestRef = doc(
    db,
    "service-request",
    requestId
);

const requestSnap = await getDoc(requestRef);

if (!requestSnap.exists()) {

    alert("Request not found.");

    return;

}

const requestData = requestSnap.data();
if (requestData.Status === "Cancelled") {

    alert(
        "This request was cancelled by the customer and can no longer be modified."
    );

    return;

}


await updateDoc(
    requestRef,
    {
        Status: "Declined",

        DeclinedAt:
            serverTimestamp()
    }
);
/*==================================
UPDATE DECLINED STATISTICS
==================================*/

await updateDoc(
    doc(
        db,
        "site-stats",
        "overview"
    ),
    {
        declinedRequests:
            increment(1)
    }
);

await updateWebsiteStatistics();

/*==================================
CUSTOMER NOTIFIATION
==================================*/

await createNotification({

    uid: requestData.CustomerId,

    requestId: requestId,

    title: "Request Declined",

    message:
        "Your electrical service request has been reviewed and unfortunately could not be accepted at this time.",

    type: "request_declined",

    icon: "fa-circle-xmark",

    sender: "staff",

    link: ""

});
        };
    });

document
.querySelectorAll(".complete")
.forEach(btn => {

    btn.onclick = async () => {

        const requestId = btn.dataset.id;

        const requestRef = doc(
            db,
            "service-request",
            requestId
        );

        try {

            /*==================================
            ATOMIC COMPLETION CHECK
            ==================================*/

            const result = await runTransaction(
                db,
                async (transaction) => {

                    const requestSnap =
                        await transaction.get(requestRef);

                    if (!requestSnap.exists()) {

                        throw new Error(
                            "Request not found."
                        );

                    }

                    const requestData =
                        requestSnap.data();


                    /*==================================
                    ALREADY COMPLETED
                    ==================================*/

                    if (
                        requestData.Status ===
                        "Completed ✅"
                    ) {

                        return {
                            completed: false,
                            requestData
                        };

                    }


                    /*==================================
                    CANCELLED REQUEST
                    ==================================*/

                    if (
                        requestData.Status ===
                        "Cancelled"
                    ) {

                        throw new Error(
                            "This request was cancelled by the customer and can no longer be modified."
                        );

                    }


                    /*==================================
                    COMPLETE REQUEST
                    ==================================*/

                    transaction.update(
                        requestRef,
                        {
                            Status: "Completed ✅"
                        }
                    );


                    return {
                        completed: true,
                        requestData
                    };

                }
            );


            /*==================================
            REQUEST WAS ALREADY COMPLETED
            ==================================*/

            if (!result.completed) {

                console.log(
                    "⚠️ Request already completed. No duplicate notification:",
                    requestId
                );

                btn.disabled = true;

                btn.textContent =
                    "Completed ✅";

                return;

            }


            /*==================================
            DISABLE BUTTON
            ==================================*/

            btn.disabled = true;

            btn.textContent =
                "Completed ✅";


            /*==================================
            CUSTOMER NOTIFICATION
            ==================================*/

            await createNotification({

                uid:
                    result.requestData.CustomerId,

                requestId:
                    requestId,

                title:
                    "Service Completed",

                message:
                    "Your electrical service request has been completed. Thank you for choosing UY Power Solutions.",

                type:
                    "request_completed",

                icon:
                    "fa-circle-check",

                sender:
                    "staff",

                link:
                    ""

            });


            console.log(
                "✅ Request completed and customer notified:",
                requestId
            );

        }

        catch (error) {

            console.error(
                "❌ Complete request error:",
                error
            );

            alert(
                error.message ||
                "Failed to complete request."
            );

        }

    };

});

}

/* ==========================
   STATUS COLORS
========================== */

function getStatusColor(status){

    switch(status){

        case "Accepted":
            return "#28a745";

        case "Declined":
            return "#dc3545";

        case "Completed ✅":
            return "#0d47a1";

        default:
            return "#ff9800";
    }
}
window.addEventListener("load", () => {

    setTimeout(() => {

        document
            .getElementById("loader")
            ?.classList.add("loader-hide");

    }, 700);

});