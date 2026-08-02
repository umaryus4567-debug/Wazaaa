import { db }
from "./firebase-config.js";

import {
collection,
getDocs
}
from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const historyList =
document.getElementById(
"historyList"
);

loadHistory();

async function loadHistory(){

historyList.innerHTML =
"<p>Loading...</p>";

try{

const snapshot =
await getDocs(
collection(
db,
"service-history"
)
);

historyList.innerHTML = "";

if(snapshot.empty){

historyList.innerHTML =

`
<div class="empty">

No archived requests found.

</div>
`;

return;
}

snapshot.forEach(doc=>{

const data =
doc.data();

historyList.innerHTML +=

`
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

}catch(error){

console.log(error);

historyList.innerHTML =

`
<div class="empty">

Failed to load history.

</div>
`;

}

}