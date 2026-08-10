/* ==================================================
   UY POWER SOLUTIONS
   STAFF LOGIN
   STAFF-LOGIN.JS
================================================== */


/* ==================================================
   DOM ELEMENTS
================================================== */

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const rememberMe = document.getElementById("rememberMe");
const forgotPassword = document.getElementById("forgotPassword");
const loginButton = document.getElementById("loginButton");

const loadingScreen = document.getElementById("loadingScreen");

const toast = document.getElementById("toast");
const toastIcon = document.getElementById("toastIcon");
const toastMessage = document.getElementById("toastMessage");


/* ==================================================
   FIREBASE VARIABLES
================================================== */

let auth = null;
let db = null;

let signInWithEmailAndPassword = null;
let signOut = null;
let setPersistence = null;

let browserLocalPersistence = null;
let browserSessionPersistence = null;

let doc = null;
let getDoc = null;
let updateDoc = null;
let serverTimestamp = null;


/* ==================================================
   STARTUP
================================================== */

console.log("UY Power Solutions Staff Login loaded.");

let firebaseReady = false;


/* ==================================================
   LOAD FIREBASE
================================================== */

async function loadFirebase() {

    try {

        console.log("Loading Firebase...");


        /*
         * Load our Firebase configuration.
         */

        const firebaseConfig =
            await import("./firebase-config.js");


        auth =
            firebaseConfig.auth;

        db =
            firebaseConfig.db;


        /*
         * Load Firebase Authentication.
         */

        const firebaseAuth =
            await import(
                "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js"
            );


        signInWithEmailAndPassword =
            firebaseAuth.signInWithEmailAndPassword;

        signOut =
            firebaseAuth.signOut;

        setPersistence =
            firebaseAuth.setPersistence;

        browserLocalPersistence =
            firebaseAuth.browserLocalPersistence;

        browserSessionPersistence =
            firebaseAuth.browserSessionPersistence;


        /*
         * Load Firestore.
         */

        const firebaseFirestore =
            await import(
                "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js"
            );


        doc =
            firebaseFirestore.doc;

        getDoc =
            firebaseFirestore.getDoc;

        updateDoc =
            firebaseFirestore.updateDoc;

        serverTimestamp =
            firebaseFirestore.serverTimestamp;


        firebaseReady = true;


        console.log(
            "Firebase loaded successfully."
        );


    } catch (error) {

        console.error(
            "Firebase failed to load:",
            error
        );


        showToast(
            "Unable to connect to the login system. Please check your connection.",
            "error"
        );

    }

}


/* ==================================================
   LOADING SCREEN
================================================== */

function showLoading(message = "Please wait...") {

    if (!loadingScreen) return;


    const text =
        loadingScreen.querySelector("p");


    if (text) {

        text.textContent =
            message;

    }


    loadingScreen.hidden = false;

}


function hideLoading() {

    if (!loadingScreen) return;

    loadingScreen.hidden = true;

}


/* ==================================================
   LOGIN BUTTON LOADING
================================================== */

function setLoginLoading(isLoading) {

    if (!loginButton) return;


    if (isLoading) {

        loginButton.disabled = true;

        loginButton.innerHTML = `
            <ion-icon
                name="reload-outline"
                aria-hidden="true"
            ></ion-icon>

            <span>Signing In...</span>
        `;

    } else {

        loginButton.disabled = false;

        loginButton.innerHTML = `
            <ion-icon
                name="log-in-outline"
                aria-hidden="true"
            ></ion-icon>

            <span>Login</span>
        `;

    }

}


/* ==================================================
   TOAST
================================================== */

let toastTimer = null;


function showToast(
    message,
    type = "info"
) {

    if (!toast || !toastMessage) {

        alert(message);

        return;

    }


    toastMessage.textContent =
        message;


    if (toastIcon) {

        if (type === "success") {

            toastIcon.setAttribute(
                "name",
                "checkmark-circle-outline"
            );

        } else if (type === "error") {

            toastIcon.setAttribute(
                "name",
                "close-circle-outline"
            );

        } else {

            toastIcon.setAttribute(
                "name",
                "information-circle-outline"
            );

        }

    }


    if (type === "success") {

        toast.style.borderLeftColor =
            "#22c55e";

        if (toastIcon) {

            toastIcon.style.color =
                "#22c55e";

        }

    } else if (type === "error") {

        toast.style.borderLeftColor =
            "#ef4444";

        if (toastIcon) {

            toastIcon.style.color =
                "#ef4444";

        }

    } else {

        toast.style.borderLeftColor =
            "#0b3d91";

        if (toastIcon) {

            toastIcon.style.color =
                "#0b3d91";

        }

    }


    toast.classList.add("show");


    clearTimeout(toastTimer);


    toastTimer =
        setTimeout(() => {

            toast.classList.remove("show");

        }, 3500);

}


/* ==================================================
   PASSWORD VISIBILITY
================================================== */

if (
    togglePassword &&
    passwordInput
) {

    togglePassword.addEventListener(
        "click",
        () => {

            const icon =
                togglePassword.querySelector(
                    "ion-icon"
                );


            if (
                passwordInput.type ===
                "password"
            ) {

                passwordInput.type =
                    "text";


                togglePassword.setAttribute(
                    "aria-label",
                    "Hide password"
                );


                togglePassword.setAttribute(
                    "aria-pressed",
                    "true"
                );


                if (icon) {

                    icon.setAttribute(
                        "name",
                        "eye-off-outline"
                    );

                }

            } else {

                passwordInput.type =
                    "password";


                togglePassword.setAttribute(
                    "aria-label",
                    "Show password"
                );


                togglePassword.setAttribute(
                    "aria-pressed",
                    "false"
                );


                if (icon) {

                    icon.setAttribute(
                        "name",
                        "eye-outline"
                    );

                }

            }

        }
    );

}


/* ==================================================
   REMEMBER ME
================================================== */

const REMEMBER_EMAIL_KEY =
    "uyPowerStaffRememberEmail";


function loadRememberedEmail() {

    if (!emailInput) return;


    const savedEmail =
        localStorage.getItem(
            REMEMBER_EMAIL_KEY
        );


    if (savedEmail) {

        emailInput.value =
            savedEmail;


        if (rememberMe) {

            rememberMe.checked =
                true;

        }

    }

}


loadRememberedEmail();


/* ==================================================
   EMAIL VALIDATION
================================================== */

function isValidEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);

}


/* ==================================================
   FIREBASE LOGIN ERROR
================================================== */

function getLoginErrorMessage(error) {

    console.error(
        "Firebase error:",
        error
    );


    switch (error.code) {

        case "auth/invalid-credential":

        case "auth/wrong-password":

        case "auth/user-not-found":

            return "Wrong email or password.";


        case "auth/invalid-email":

            return "Please enter a valid email address.";


        case "auth/user-disabled":

            return "This account has been disabled.";


        case "auth/too-many-requests":

            return "Too many login attempts. Please try again later.";


        case "auth/network-request-failed":

            return "Network error. Please check your internet connection.";


        case "auth/operation-not-allowed":

            return "Email and password login is not enabled.";


        default:

            return "Login failed. Please try again.";

    }

}


/* ==================================================
   LOGIN FORM
================================================== */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (event) => {

            /*
             * VERY IMPORTANT:
             * Prevent normal browser form submission.
             */

            event.preventDefault();
            event.stopPropagation();


            if (!firebaseReady) {

                showToast(
                    "Login system is still loading. Please try again.",
                    "error"
                );

                return;

            }


            const email =
                emailInput.value
                    .trim()
                    .toLowerCase();


            const password =
                passwordInput.value;


            /* ======================================
               VALIDATION
            ====================================== */

            if (!email) {

                showToast(
                    "Please enter your email address.",
                    "error"
                );

                emailInput.focus();

                return;

            }


            if (!isValidEmail(email)) {

                showToast(
                    "Please enter a valid email address.",
                    "error"
                );

                emailInput.focus();

                return;

            }


            if (!password) {

                showToast(
                    "Please enter your password.",
                    "error"
                );

                passwordInput.focus();

                return;

            }


            /* ======================================
               REMEMBER EMAIL
            ====================================== */

            if (
                rememberMe &&
                rememberMe.checked
            ) {

                localStorage.setItem(
                    REMEMBER_EMAIL_KEY,
                    email
                );

            } else {

                localStorage.removeItem(
                    REMEMBER_EMAIL_KEY
                );

            }


            /* ======================================
               START LOGIN
            ====================================== */

            setLoginLoading(true);

            showLoading(
                "Signing in..."
            );


            try {

                /* ==================================
                   SESSION PERSISTENCE
                ================================== */

                if (
                    rememberMe &&
                    rememberMe.checked
                ) {

                    await setPersistence(
                        auth,
                        browserLocalPersistence
                    );

                } else {

                    await setPersistence(
                        auth,
                        browserSessionPersistence
                    );

                }


                /* ==================================
                   FIREBASE AUTHENTICATION
                ================================== */

                const credential =
                    await signInWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                const user =
                    credential.user;


                console.log(
                    "Firebase authentication successful."
                );
                
                console.log(
    "Authenticated UID:",
    user.uid
);

console.log(
    "Checking Firestore user document..."
);


                /* ==================================
                   FIRESTORE USER DOCUMENT
                ================================== */

                const userRef =
                    doc(
                        db,
                        "users",
                        user.uid
                    );


                const userSnapshot =
                    await getDoc(userRef);
                    
                    console.log(
    "Firestore document exists:",
    userSnapshot.exists()
);

if (userSnapshot.exists()) {

    console.log(
        "Firestore user data:",
        userSnapshot.data()
    );

}


                /* ==================================
                   USER DOCUMENT DOES NOT EXIST
                ================================== */

                if (
                    !userSnapshot.exists()
                ) {

                    await signOut(auth);

                    hideLoading();

                    setLoginLoading(false);


                    showToast(
                        "Your account record was not found.",
                        "error"
                    );

                    return;

                }


                /* ==================================
                   GET USER DATA
                ================================== */

                const userData =
                    userSnapshot.data();


                console.log(
                    "User role:",
                    userData.role
                );


                /* ==================================
                   STAFF ROLE CHECK
                ================================== */

                if (
                    userData.role !== "staff"
                ) {

                    await signOut(auth);

                    hideLoading();

                    setLoginLoading(false);


                    showToast(
                        "Access denied. Staff accounts only.",
                        "error"
                    );

                    return;

                }


                /* ==================================
                   UPDATE LAST LOGIN
                ================================== */

                try {

                    await updateDoc(
                        userRef,
                        {
                            lastLogin:
                                serverTimestamp()
                        }
                    );

                } catch (updateError) {

                    /*
                     * A failed lastLogin update should
                     * NOT prevent a valid staff member
                     * from accessing the dashboard.
                     */

                    console.warn(
                        "Could not update lastLogin:",
                        updateError
                    );

                }


                /* ==================================
                   SUCCESS
                ================================== */

                showToast(
                    "Login successful. Welcome back!",
                    "success"
                );


                setTimeout(() => {

                    window.location.href =
                        "dashboard.html";

                }, 700);

            } catch (error) {

                hideLoading();

                setLoginLoading(false);


                showToast(
                    getLoginErrorMessage(error),
                    "error"
                );

            }

        }
    );

} else {

    console.error(
        "ERROR: loginForm was not found."
    );

}


/* ==================================================
   FORGOT PASSWORD
================================================== */

if (forgotPassword) {

    /*
     * The link already points to:
     *
     * forgot-password.html
     *
     * So we intentionally allow the browser
     * to navigate there normally.
     */

    forgotPassword.addEventListener(
        "click",
        () => {

            console.log(
                "Opening Forgot Password page."
            );

        }
    );

}


/* ==================================================
   LOAD FIREBASE NOW
================================================== */

loadFirebase();