import { db }
from "./firebase-config.js";

import {
collection,
query,
where,
getDocs,
doc,
getDoc
}
from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const searchBtn =
document.getElementById("searchBtn");
const refreshBtn =
document.getElementById("refreshBtn");

const result =
document.getElementById("result");
document
.getElementById("searchInput")
.addEventListener("keypress",(e)=>{

if(e.key==="Enter"){

searchBtn.click();

}

});

searchBtn.addEventListener(
"click",
async () => {

const searchValue =
document
.getElementById("searchInput")
.value
.trim();

if(!searchValue){

alert(
"Enter Phone Number or Request ID"
);

return;
}

result.innerHTML = `
<div class="loading-card">

<div class="spinner"></div>

<p>Searching for your request...</p>

</div>
`;

try{

/* SEARCH BY REQUEST ID */

const requestDoc =
await getDoc(
doc(
db,
"service-request",
searchValue
)
);

if(requestDoc.exists()){

const data =
requestDoc.data();

result.innerHTML =
buildCard(
data,
requestDoc.id
);

refreshBtn.style.display = "block";

return;
}

/* SEARCH BY PHONE */

const q =
query(
collection(
db,
"service-request"
),
where(
"Phone",
"==",
searchValue
)
);

const snapshot =
await getDocs(q);

result.innerHTML = "";

if(snapshot.empty){

result.innerHTML = `

<div class="empty-state">

<div class="empty-icon">📭</div>

<h3>No Request Found</h3>

<p>
We couldn't find any request matching the phone number or Request ID you entered.
</p>

<p class="hint">
Please check your details and try again.
</p>

</div>

`;

return;
}

snapshot.forEach(docItem => {

const data =
docItem.data();

result.innerHTML +=
buildCard(
data,
docItem.id
);

});

refreshBtn.style.display = "block";

}catch(error){

console.log(error);

result.innerHTML = `

<div class="result-card">

<h3>Error</h3>

<p>
Failed to retrieve request.
</p>

</div>

`;

}

});

function buildCard(data,id){

let date = "";

if(data.CreatedAt){

date =
data.CreatedAt
.toDate()
.toLocaleString();
}

return `

<div class="result-card">

<h3>
${data.Customername || ""}
</h3>

<div class="request-id">

<b>Request ID:</b>

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

${buildTimeline(data.Status)}

</div>

<div
class="status-badge ${getStatusClass(data.Status)}">

${data.Status || "Pending"}

</div>

</div>

`;
}

function getStatusClass(status){

switch(status){

case "Accepted":
return "accepted";

case "Declined":
return "declined";

case "Completed ✅":
return "completed";

default:
return "pending";
}

}
function buildTimeline(status){

const steps=[
"Pending",
"Accepted",
"Completed ✅"
];

let html="";

steps.forEach(step=>{

const active=
steps.indexOf(step)<=steps.indexOf(status)
? "active"
: "";

html+=`

<div class="timeline-step ${active}">

<div class="circle"></div>

<span>${step.replace(" ✅","")}</span>

</div>

`;

});

return html;

}

window.copyRequestID = function(id){

navigator.clipboard.writeText(id);

alert("✅ Request ID copied.");

};

refreshBtn.addEventListener("click", () => {

searchBtn.click();

});