import { db } from "./firebase-config.js";
import { showToast } from "./ui.js";

import {
    collection,
    addDoc,
    serverTimestamp
}
from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const form =
document.getElementById("contactForm");

form.addEventListener(
"submit",
async (e) => {

    e.preventDefault();

    const name =
    document.getElementById("name").value.trim();

    const email =
    document.getElementById("email").value.trim();

    const phone =
    document.getElementById("phone").value.trim();

    const message =
    document.getElementById("message").value.trim();
    
    const submitBtn =
document.querySelector(
'button[type="submit"]'
);

submitBtn.disabled = true;

submitBtn.innerHTML =
'<ion-icon name="reload"></ion-icon> Sending...';

    try {

        /* ==========================
           SAVE TO FIREBASE
        ========================== */

        await addDoc(
            collection(
                db,
                "contact-messages"
            ),
            {
                Name: name,
                Email: email,
                Phone: phone,
                Message: message,
                CreatedAt: serverTimestamp()
            }
        );

        /* ==========================
           OPEN WHATSAPP
        ========================== */

        const whatsappMessage =

`📩 New Contact Request

Name: ${name}

Email: ${email}

Phone: ${phone}

Message:
${message}`;

        const whatsappURL =

`https://wa.me/2348163196577?text=${encodeURIComponent(whatsappMessage)}`;

        window.open(
            whatsappURL,
            "_blank"
        );

        /* ==========================
           OPEN GMAIL
        ========================== */

        const emailSubject =
        "New Contact Request";

        const emailBody =

`Name: ${name}

Email: ${email}

Phone: ${phone}

Message:
${message}`;

        const gmailURL =

`mailto:umaryus4567@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

        window.location.href =
        gmailURL;

        showToast(
"Message sent successfully ✅",
"success"
);

        form.reset();
        submitBtn.disabled = false;

submitBtn.innerHTML =
'<ion-icon name="book"></ion-icon> Submit Request';

    } catch(error) {

        console.log(error);
        submitBtn.disabled = false;

submitBtn.innerHTML =
'<ion-icon name="book"></ion-icon> Submit Request';

        showToast(
"Unable to send message.",
"error"
);

    }

});

window.addEventListener("load", () => {

    setTimeout(() => {

        document
            .getElementById("loader")
            ?.classList.add("loader-hide");

    }, 700);

});