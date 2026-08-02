import { db } from "./firebase-config.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";


const form = document.getElementById("serviceRequestForm");

form.addEventListener("submit", async (e) => {

    e.preventDefault();
    



    const customerName =
        document.getElementById("customerName").value;

    const phone =
        document.getElementById("phone").value;

    const location =
        document.getElementById("location").value;

    const area =
        document.getElementById("area").value;

    const busStop =
        document.getElementById("busStop").value;

    const address =
        document.getElementById("address").value;

    const description =
        document.getElementById("description").value;

    const urgency =
        document.querySelector(
            'input[name="urgency"]:checked'
        )?.value || "";

    try {

       
        const submitBtn =
document.querySelector(
'button[type="submit"]'
);

submitBtn.disabled = true;
submitBtn.innerHTML =
'<span class="spinner"></span> Submitting...';

        await addDoc(
            collection(db, "service-request"),
            {
                Customername: customerName,
                Phone: phone,
                Location: location,
                Area: area,
                BusStop: busStop,
                Address: address,
                Description: description,
                Urgency: urgency,
                Status: "Pending",
                CreatedAt: serverTimestamp()
            }
        );

        document.getElementById(
    "successMessage"
).textContent =
"✅ Request submitted successfully. A technician will review your request shortly.";
submitBtn.disabled = false;
submitBtn.textContent =
"Submit Request ✅";

form.reset();

        form.reset();

    } catch (error) {
      submitBtn.disabled = false;
submitBtn.textContent =
"Submit Request ✅";

        console.error(error);

        alert(error.message);

    }

});

window.addEventListener("load", () => {

    setTimeout(() => {

        document
            .getElementById("loader")
            ?.classList.add("loader-hide");

    }, 700);

});