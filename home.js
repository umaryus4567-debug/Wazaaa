import { db } from "./firebase-config.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import {
    auth,
    protectPage,
    loadUser,
    logoutUser
} from "./auth-utils.js";

import {
    listenForNotifications,
    markAllNotificationsAsRead
} from "./notification-utils.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

const notificationButton =
document.getElementById("notificationButton");

const notificationDropdown =
document.getElementById("notificationDropdown");

const notificationCount =
document.getElementById("notificationCount");

const notificationList =
document.getElementById("notificationList");

const logoutButton =
document.getElementById("logoutButton");

protectPage();
loadUser();
onAuthStateChanged(auth, (user) => {

    if (!user) return;

    listenForNotifications(user.uid, (notifications) => {

        notificationList.innerHTML = "";

        if (notifications.length === 0) {

            notificationCount.textContent = "";

            notificationList.innerHTML = `
                <div class="empty-notification">
                    No notifications yet.
                </div>
            `;

            return;

        }

        const unread =
        notifications.filter(n => !n.read).length;

        notificationCount.textContent =
        unread > 0 ? unread : "";

        notifications.forEach(notification => {

            notificationList.innerHTML += `

                <div class="notification-card ${notification.read ? "" : "unread"}">

                    <div class="notification-title">

                        <i class="fa-solid ${notification.icon}"></i>

                        ${notification.title}

                    </div>

                    <div class="notification-message">

                        ${notification.message}

                    </div>

                </div>

            `;

        });

    });

});
if (notificationButton) {

    notificationButton.addEventListener("click", async () => {

        notificationDropdown.classList.toggle("show");

        const user = auth.currentUser;

        if (user) {

            await markAllNotificationsAsRead(user.uid);

        }

    });
    
if (logoutButton) {

    logoutButton.addEventListener("click", async () => {

        try {

            logoutButton.disabled = true;

            await logoutUser();

            window.location.replace("login.html");

        }

        catch (error) {

            console.error(error);

            logoutButton.disabled = false;

        }

    });

}

document.addEventListener("click", (e) => {

    if (

        notificationDropdown &&
        notificationButton &&
        !notificationDropdown.contains(e.target) &&
        !notificationButton.contains(e.target)

    ) {

        notificationDropdown.classList.remove("show");

    }

});

window.addEventListener("load", () => {

    console.log("================================");
    console.log("UY Power Home Ready");
    console.log("Notifications Ready");
    console.log("================================");

});

}



function showToast(message,type="success"){

const toast=document.getElementById("toast");

toast.textContent=message;

toast.className=`toast ${type} show`;

setTimeout(()=>{

toast.className="toast";

},3000);

}

/*==================================
SHOW STAFF DASHBOARD BUTTON
==================================*/

const staffContainer =
document.getElementById("staffDashboardContainer");

if(staffContainer){

    try{

        const user = auth.currentUser;

        if(user){

            const snap = await getDoc(
                doc(db,"users",user.uid)
            );

            if(snap.exists()){

                const data = snap.data();

                if(data.role === "staff"){

                    staffContainer.innerHTML = `

                    <a href="dashboard.html"
                    class="staff-dashboard-btn">

                        <i class="fa-solid fa-user-shield"></i>

                        Staff Dashboard

                    </a>

                    `;

                }

            }

        }

    }

    catch(error){

        console.error(error);

    }

}

window.addEventListener("load", () => {

    setTimeout(() => {

        const loader =
        document.getElementById("loader");

        if(loader){

            loader.classList.add("loader-hide");

        }

    },800);

});