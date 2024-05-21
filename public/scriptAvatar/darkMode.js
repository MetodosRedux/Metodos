let darkModeToggle = document.getElementById("flexSwitchCheckDefault");
let logo = document.getElementById("logo");

function toggleDarkMode() {
    if (darkModeToggle.checked) {
        document.body.classList.add("dark-mode");
        localStorage.setItem("darkMode", "enabled");
        //dark;
    } else {
        document.body.classList.remove("dark-mode");
        localStorage.setItem("darkMode", null);
        //light;
    }
}

function applyDarkMode() {
    let darkMode = localStorage.getItem("darkMode");

    if (darkMode === "enabled") {
        document.body.classList.add("dark-mode");
        darkModeToggle.checked = true;
        //dark
    } else {
        document.body.classList.remove("dark-mode");
        darkModeToggle.checked = false;
        //light;
    }
}

applyDarkMode();

darkModeToggle.addEventListener("change", toggleDarkMode);