import { db }
from "./firebase-config.js";

import {
collection,
addDoc,
onSnapshot,
deleteDoc,
doc
}
from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const addBtn =
document.getElementById(
"addTechBtn"
);

const container =
document.getElementById(
"techniciansContainer"
);

/* =====================
ADD TECHNICIAN
===================== */

addBtn.onclick =
async ()=>{

const name =
document.getElementById(
"techName"
).value.trim();

const phone =
document.getElementById(
"techPhone"
).value.trim();

const specialty =
document.getElementById(
"techSpecialty"
).value.trim();

const status =
document.getElementById(
"techStatus"
).value;

if(!name || !phone){

alert(
"Fill all fields"
);

return;
}

await addDoc(
collection(
db,
"technicians"
),
{
Name:name,
Phone:phone,
Specialty:specialty,
Status:status
}
);

document.getElementById(
"techName"
).value="";

document.getElementById(
"techPhone"
).value="";

document.getElementById(
"techSpecialty"
).value="";
};

/* =====================
LOAD TECHNICIANS
===================== */

onSnapshot(
collection(
db,
"technicians"
),

(snapshot)=>{

container.innerHTML="";

snapshot.forEach(
(documentItem)=>{

const data =
documentItem.data();

let statusClass =
"available";

if(data.Status === "Busy")
statusClass = "busy";

if(data.Status === "Offline")
statusClass = "offline";

const card =
document.createElement(
"div"
);

card.className =
"tech-card";

card.innerHTML = `

<h3>
👨‍🔧 ${data.Name}
</h3>

<p>
📞 ${data.Phone}
</p>

<p>
🔧 ${data.Specialty || "General Technician"}
</p>

<p class="status ${statusClass}">
${data.Status}
</p>

<div class="btn-group">

<button
class="whatsapp-btn"
onclick="window.open('https://wa.me/${data.Phone}','_blank')">

WhatsApp

</button>

<button
class="delete-btn"
data-id="${documentItem.id}">

Delete

</button>

</div>

`;

container.appendChild(
card
);

});

addDeleteEvents();

});

function addDeleteEvents(){

document
.querySelectorAll(
".delete-btn"
)
.forEach(btn=>{

btn.onclick =
async ()=>{

const confirmDelete =
confirm(
"Delete technician?"
);

if(!confirmDelete)
return;

await deleteDoc(
doc(
db,
"technicians",
btn.dataset.id
)
);

};

});

}