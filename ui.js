/*==================================
UY POWER SOLUTIONS
UI LIBRARY
==================================*/

/*==================================
SHOW TOAST
==================================*/

export function showToast(message, type = "success") {

    let toast =
    document.getElementById("toast");

    if (!toast) {

        toast =
        document.createElement("div");

        toast.id = "toast";

        document.body.appendChild(toast);

    }

    toast.textContent = message;

    toast.className = "";

    toast.classList.add("toast");

    toast.classList.add(type);

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}