import { auth, db } from "./firebase-config.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
    prompt: "select_account"
});

/*==================================
REGISTER
==================================*/

export async function registerUser(fullName, email, password, phone) {

    const credential =
    await createUserWithEmailAndPassword(
        auth,
        email,
        password
    );

    const user = credential.user;

    await updateProfile(user,{
        displayName: fullName
    });

    await setDoc(doc(db,"users",user.uid),{

        uid:user.uid,

        fullName,

        email,

        phone,

        role:"customer",

        provider:"email",

        photoURL:user.photoURL || "",

        createdAt:serverTimestamp(),

        lastLogin:serverTimestamp()

    });

    return user;

}

/*==================================
LOGIN
==================================*/

export async function loginUser(email,password){

    const credential =
    await signInWithEmailAndPassword(
        auth,
        email,
        password
    );

    const user = credential.user;

    await updateDoc(
        doc(db,"users",user.uid),
        {
            lastLogin:serverTimestamp()
        }
    );

    return user;

}

/*==================================
GOOGLE LOGIN
==================================*/

export async function googleLogin(){

    const result =
    await signInWithPopup(
        auth,
        googleProvider
    );

    const user = result.user;

    const userRef =
    doc(db,"users",user.uid);

    const snap =
    await getDoc(userRef);

    if(!snap.exists()){

        await setDoc(userRef,{

            uid:user.uid,

            fullName:user.displayName || "Customer",

            email:user.email,

            phone:"",

            role:"customer",

            provider:"google",

            photoURL:user.photoURL || "",

            createdAt:serverTimestamp(),

            lastLogin:serverTimestamp()

        });

    }

    else{

        await updateDoc(userRef,{
            lastLogin:serverTimestamp()
        });

    }

    return user;

}

/*==================================
RESET PASSWORD
==================================*/

export async function resetPassword(email){

    return await sendPasswordResetEmail(
        auth,
        email
    );

}

/*==================================
LOGOUT
==================================*/

export async function logoutUser(){

    await signOut(auth);

}

/*==================================
CURRENT USER
==================================*/

export function getCurrentUser(){

    return auth.currentUser;

}

/*==================================
AUTH LISTENER
==================================*/

export function authListener(callback){

    return onAuthStateChanged(auth, callback);

}

/*==================================
PROTECT PAGE
==================================*/

export function protectPage(){

    return new Promise((resolve)=>{

        onAuthStateChanged(auth,(user)=>{

            if(!user){

                window.location.replace("login.html");

                return;

            }

            resolve(user);

        });

    });

}

/*==================================
GUEST ONLY
==================================*/

export function guestOnly(){

    return new Promise((resolve)=>{

        onAuthStateChanged(auth,(user)=>{

            if(user){

                window.location.replace("home.html");

                return;

            }

            resolve();

        });

    });

}

/*==================================
STAFF ONLY
==================================*/

export function protectStaffPage(){

    return new Promise((resolve)=>{

        onAuthStateChanged(auth, async(user)=>{

            if(!user){

                window.location.replace("login.html");

                return;

            }

            try{

                const snap = await getDoc(
                    doc(db,"users",user.uid)
                );

                if(!snap.exists()){

                    window.location.replace("home.html");

                    return;

                }

                const data = snap.data();

                if(data.role !== "staff"){

                    alert("Access denied. Staff only.");

                    window.location.replace("home.html");

                    return;

                }

                resolve(user);

            }

            catch(error){

                console.error(error);

                window.location.replace("home.html");

            }

        });

    });

}


/*==================================
LOAD USER
==================================*/

export async function loadUser(){

    const user = auth.currentUser;

    if(!user) return;

    const userName =
    document.getElementById("userName");

    const userEmail =
    document.getElementById("userEmail");

    const userImage =
    document.getElementById("userImage");

    if(userName){

        userName.textContent =
        user.displayName || "Customer";

    }

    if(userEmail){

        userEmail.textContent =
        user.email;

    }

    if(userImage){

        userImage.src =
        user.photoURL || "default-user.png";

    }

}

/*==================================
EXPORT AUTH
==================================*/

export { auth };

