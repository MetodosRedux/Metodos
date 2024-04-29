let darkModeToggle = document.getElementById("flexSwitchCheckDefault");
let logo = document.getElementById("logo");

function toggleDarkMode() {
    if (darkModeToggle.checked) {
        document.body.classList.add("dark-mode");
        localStorage.setItem("darkMode", "enabled");
        switchImageMode("_dark");
    } else {
        document.body.classList.remove("dark-mode");
        localStorage.setItem("darkMode", null);
        switchImageMode("_light");
    }
}

function switchImageMode(mode) {
    let images = document.querySelectorAll("img");

    images.forEach(image => {
        let src = image.src;
        let filename = src.split('/').pop(); 
        let lastIndex = filename.lastIndexOf(".");
        let imageName = filename.substring(0, lastIndex);
        let extension = filename.substring(lastIndex);

        imageName = imageName.replace(/_dark|_light/g, '');

        image.src = src.replace(filename, imageName + mode + extension);
    });
}


function applyDarkMode() {
    let darkMode = localStorage.getItem("darkMode");

    if (darkMode === "enabled") {
        document.body.classList.add("dark-mode");
        darkModeToggle.checked = true;
        switchImageMode("_dark");
    } else {
        document.body.classList.remove("dark-mode");
        darkModeToggle.checked = false;
        switchImageMode("_light");
    }
}


applyDarkMode();

darkModeToggle.addEventListener("change", toggleDarkMode);

let loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener('click', (event) => {
    event.preventDefault(); 
    location.href = "index.html"; 
});
