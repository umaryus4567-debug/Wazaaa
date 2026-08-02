import { auth, db } from "./firebase-config.js";

import { onAuthStateChanged }
from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
    protectStaffPage,
    logoutUser
} from "./auth-utils.js";

await protectStaffPage();

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
addDoc
}
from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

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

const logoutButton =
document.getElementById("logoutButton");
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

            allRequests.push({
                id: documentItem.id,
                ...data
            });

            total++;

            if(data.Status === "Pending") pending++;

            if(data.Status === "Accepted") accepted++;

            if(data.Status === "Declined") declined++;

            if(data.Status === "Completed ✅") completed++;
        });

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

        renderRequests(allRequests);
    }
);

console.log("Technicians Array:", technicians);
/* ==========================
   RENDER REQUESTS
========================== */

function renderRequests(requests){

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

            await updateDoc(
                doc(
                    db,
                    "service-request",
                    btn.dataset.id
                ),
                {
                    Status:"Accepted"
                }
            );
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

            if(!requestSnap.exists()){

                alert(
                    "Request not found"
                );

                return;
            }

            const requestData =
            requestSnap.data();

            await addDoc(
                collection(
                    db,
                    "service-history"
                ),
                requestData
            );

            await deleteDoc(
                requestRef
            );

            alert(
                "Request archived successfully ✅"
            );

        } catch(error){

            console.error(error);

            alert(
                "Failed to archive request"
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

            await updateDoc(
                doc(
                    db,
                    "service-request",
                    btn.dataset.id
                ),
                {
                    Status:"Declined"
                }
            );
        };
    });

    document
    .querySelectorAll(".complete")
    .forEach(btn => {

        btn.onclick = async () => {

            await updateDoc(
                doc(
                    db,
                    "service-request",
                    btn.dataset.id
                ),
                {
                    Status:"Completed ✅"
                }
            );
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

const loader =
document.getElementById("loader");

if(loader){

    setTimeout(()=>{

        loader.classList.add("loader-hide");

    },500);

}

/* ==========================
   LOGOUT
========================== */

if(logoutButton){

    logoutButton.addEventListener("click", async ()=>{

        try{

            logoutButton.disabled = true;

            await logoutUser();

            window.location.replace("login.html");

        }

        catch(error){

            console.error(error);

            logoutButton.disabled = false;

            alert("Logout failed.");

        }

    });

}