/*==================================================
UY POWER SOLUTIONS
HOME PAGE
==================================================*/

import { auth, db } from "./firebase-config.js";

import {
    doc,
    getDoc,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import {
    loadUser,
    logoutUser
} from "./auth-utils.js";

import {
    listenForNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
} from "./notification-utils.js";

import { authReady } from "./auth-guard.js";


/*==================================
DOM ELEMENTS
==================================*/

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

const staffContainer =
    document.getElementById("staffDashboardContainer");
    
    /*==================================
LOAD COMPLETED REQUEST STATISTIC
==================================*/

async function loadCompletedRequestCount() {

    const counter =
        document.querySelector(
            ".loading-counter"
        );

    if (!counter) return;

    try {

        const statsRef = doc(
            db,
            "site-stats",
            "overview"
        );

        const statsSnap =
            await getDoc(statsRef);


        let completedRequests = 0;


        if (statsSnap.exists()) {

            completedRequests =
                Number(
                    statsSnap.data()
                        .completedRequests || 0
                );

        }


        console.log(
            "📊 Real completed requests:",
            completedRequests
        );


        animateCounter(
            counter,
            completedRequests
        );


    }

    catch (error) {

        console.error(
            "❌ Completed request statistic error:",
            error
        );

        counter.textContent = "0";

    }

}

/*==================================
LOAD SATISFIED CLIENT STATISTIC
==================================*/

async function loadSatisfiedClientCount() {

    const counter =
        document.getElementById(
            "satisfiedClientsCount"
        );

    if (!counter) return;

    try {

        const historyRef =
            collection(
                db,
                "service-history"
            );

        const snapshot =
            await getDocs(historyRef);

        const satisfiedClients =
            snapshot.size;


        console.log(
            "😊 Real satisfied clients:",
            satisfiedClients
        );


        animateCounter(
            counter,
            satisfiedClients
        );

    }

    catch (error) {

        console.error(
            "❌ Satisfied client statistic error:",
            error
        );

        counter.textContent = "0";

    }

}

/*==================================
LOAD REAL SUCCESS RATE
==================================*/

async function loadSuccessRate() {

    const counter =
        document.getElementById(
            "successRateCount"
        );

    if (!counter) return;

    try {

        const requestsRef =
            collection(
                db,
                "service-request"
            );

        const historyRef =
            collection(
                db,
                "service-history"
            );


        const [
            requestsSnapshot,
            historySnapshot
        ] = await Promise.all([

            getDocs(requestsRef),

            getDocs(historyRef)

        ]);


        let completed = 0;
        let declined = 0;


        /*==================================
        CHECK ACTIVE REQUESTS
        ==================================*/

        requestsSnapshot.forEach((documentItem) => {

            const data =
                documentItem.data();

            if (data.Status === "Completed ✅") {

                completed++;

            }

            else if (data.Status === "Declined") {

                declined++;

            }

        });


        /*==================================
        CHECK ARCHIVED COMPLETED REQUESTS
        ==================================*/

        historySnapshot.forEach((documentItem) => {

            const data =
                documentItem.data();

            if (data.Status === "Completed ✅") {

                completed++;

            }

        });


        const finalRequests =
            completed + declined;


        /*==================================
        NO FINAL RESULTS YET
        ==================================*/

        if (finalRequests === 0) {

            counter.textContent = "—";

            console.log(
                "📊 Success rate: No final requests yet."
            );

            return;

        }


        /*==================================
        CALCULATE SUCCESS RATE
        ==================================*/

        const successRate =
            Math.round(
                (completed / finalRequests) * 100
            );


        counter.textContent =
            `${successRate}%`;


        console.log(
            "📊 Real success rate:",
            successRate + "%"
        );

        console.log(
            "Completed:",
            completed,
            "Declined:",
            declined
        );

    }

    catch (error) {

        console.error(
            "❌ Success rate statistic error:",
            error
        );

        counter.textContent = "—";

    }

}
/*==================================
ANIMATE REAL COUNTER
==================================*/

function animateCounter(
    element,
    target
) {

    const duration = 1200;

    const startTime =
        performance.now();


    function updateCounter(
        currentTime
    ) {

        const elapsed =
            currentTime - startTime;

        const progress =
            Math.min(
                elapsed / duration,
                1
            );


        const easedProgress =
            1 -
            Math.pow(
                1 - progress,
                3
            );


        const currentValue =
            Math.floor(
                easedProgress * target
            );


        element.textContent =
            currentValue;


        if (progress < 1) {

            requestAnimationFrame(
                updateCounter
            );

        }

        else {

            element.textContent =
                target;

        }

    }


    requestAnimationFrame(
        updateCounter
    );

}

/*==================================
WAIT FOR AUTH GUARD
==================================*/

authReady.then(async ({ user, data, role }) => {

    console.log(
        "✅ HOME RELEASED BY AUTH GUARD:",
        user.uid
    );


    /*==================================
    LOAD USER INFORMATION
    ==================================*/

    await loadUser();


    /*==================================
    LOAD USER ROLE
    ==================================*/

    await loadUserRole(user);
    
    await loadCompletedRequestCount();

await loadSatisfiedClientCount();

await loadSuccessRate();


    /*==================================
    NOTIFICATIONS
    ==================================*/

    startNotificationListener(user);

})
.catch((error) => {

    console.error(
        "❌ HOME AUTH INITIALIZATION ERROR:",
        error
    );

});
/*==================================
LOAD USER ROLE
==================================*/

async function loadUserRole(user) {

    if (!staffContainer) return;

    try {

        const userRef =
            doc(db, "users", user.uid);

        const snapshot =
            await getDoc(userRef);


        if (!snapshot.exists()) {

            console.warn(
                "User document not found."
            );

            return;

        }


        const data =
            snapshot.data();


        console.log(
            "User role:",
            data.role
        );


        /*==================================
        STAFF DASHBOARD
        ==================================*/

        if (data.role === "staff") {

            staffContainer.innerHTML = `

                <a
                    href="dashboard.html"
                    class="staff-dashboard-btn">

                    <i class="fa-solid fa-user-shield"></i>

                    Staff Dashboard

                </a>

            `;

        }

        else {

            staffContainer.innerHTML = "";

        }

    }

    catch (error) {

        console.error(
            "Load User Role Error:",
            error
        );

    }

}
/*==================================
NOTIFICATION LISTENER
==================================*/

function startNotificationListener(user) {

    if (!notificationList) return;

    listenForNotifications(
        user.uid,
        (notifications) => {

            notificationList.innerHTML = "";

            /*==================================
            NO NOTIFICATIONS
            ==================================*/

            if (notifications.length === 0) {

                if (notificationCount) {
                    notificationCount.textContent = "";
                }

                notificationList.innerHTML = `

                    <div class="empty-notification">

                        No notifications yet.

                    </div>

                `;

                return;
            }


            /*==================================
            COUNT UNREAD
            ==================================*/

            const unread =
                notifications.filter(
                    notification => !notification.read
                ).length;


            if (notificationCount) {

                notificationCount.textContent =
                    unread > 0
                        ? unread
                        : "";

            }


            /*==================================
            DISPLAY NOTIFICATIONS
            ==================================*/

            notifications.forEach((notification) => {

                const card =
                    document.createElement("div");


                card.className =
                    `notification-card ${
                        notification.read
                            ? ""
                            : "unread"
                    }`;


                card.dataset.id =
                    notification.id;


                const notificationType =
                    notification.type || "default";


                card.innerHTML = `

                    <div class="notification-icon ${notificationType}">

                        <i class="fa-solid ${
                            notification.icon || "fa-bell"
                        }"></i>

                    </div>


                    <div class="notification-content">

                        <div class="notification-title">

                            ${notification.title}

                        </div>


                        <div class="notification-message">

                            ${notification.message}

                        </div>


                        ${
                            notification.createdAt
                                ? `
                                    <div class="notification-time">

                                        ${formatNotificationTime(
                                            notification.createdAt
                                        )}

                                    </div>
                                `
                                : ""
                        }

                    </div>

                `;


                notificationList.appendChild(card);
                
                card.addEventListener("click", async () => {

    if (notification.read) return;

    try {

        await markNotificationAsRead(
            notification.id
        );

        console.log(
            "✅ Notification marked as read:",
            notification.id
        );

    }

    catch (error) {

        console.error(
            "❌ Failed to mark notification as read:",
            error
        );

    }

});

            });

        }
    );

}
  


/*==================================
FORMAT NOTIFICATION TIME
==================================*/

function formatNotificationTime(timestamp) {

    if (!timestamp) return "";

    try {

        const date =
            timestamp.toDate
                ? timestamp.toDate()
                : new Date(timestamp);

        return date.toLocaleString();

    }

    catch (error) {

        return "";

    }

}


/*==================================
NOTIFICATION BUTTON
==================================*/

if (notificationButton) {

    notificationButton.addEventListener(
        "click",
        () => {

            if (!notificationDropdown) return;

            notificationDropdown.classList.toggle(
                "show"
            );

        }
    );

}

/*==================================
MARK ALL NOTIFICATIONS AS READ
==================================*/

const clearNotifications =
    document.getElementById("clearNotifications");


if (clearNotifications) {

    clearNotifications.addEventListener(
        "click",
        async (event) => {

            event.stopPropagation();

            const user =
                auth.currentUser;


            if (!user) return;


            try {

                await markAllNotificationsAsRead(
                    user.uid
                );

                console.log(
                    "✅ All notifications marked as read."
                );

            }

            catch (error) {

                console.error(
                    "❌ Mark all notifications error:",
                    error
                );

            }

        }
    );

}


/*==================================
CLOSE NOTIFICATION DROPDOWN
==================================*/

document.addEventListener(
    "click",
    (event) => {

        if (

            notificationDropdown &&
            notificationButton &&
            !notificationDropdown.contains(
                event.target
            ) &&
            !notificationButton.contains(
                event.target
            )

        ) {

            notificationDropdown.classList.remove(
                "show"
            );

        }

    }
);


/*==================================
LOGOUT
==================================*/

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async () => {

            try {

                logoutButton.disabled = true;

                logoutButton.textContent =
                    "Logging out...";


                await logoutUser();


                window.location.replace(
                    "login.html"
                );

            }

            catch (error) {

                console.error(
                    "Logout Error:",
                    error
                );


                logoutButton.disabled = false;

                logoutButton.textContent =
                    "Logout";

            }

        }
    );

}


/*==================================
PAGE LOADER
==================================*/

window.addEventListener("load", () => {

    console.log("⏳ HOME LOADER STARTED");

    const loader =
        document.getElementById("loader");

    if (!loader) {

        console.error(
            "❌ Loader element not found."
        );

        return;

    }

    console.log(
        "✅ Loader element found."
    );


    setTimeout(() => {

        /* Hide loader */
        loader.classList.add(
            "loader-hide"
        );


        /* Tell the page that loading is finished */
        document.body.classList.add(
            "page-loaded"
        );


        console.log(
            "✅ HOME LOADER HIDDEN"
        );

        console.log(
            "🎬 HERO ANIMATION STARTED"
        );


    }, 2000);

});


/*==================================
HOME READY
==================================*/

console.log(
    "================================"
);

console.log(
    "UY POWER SOLUTIONS"
);

console.log(
    "Home System Ready"
);

console.log(
    "User System Ready"
);

console.log(
    "Notification System Ready"
);

console.log(
    "Staff Access System Ready"
);

console.log(
    "================================"
);