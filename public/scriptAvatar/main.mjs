"use strict";
import { TinitialiseScene, character, camera } from "./scene.mjs";
import { showColors, showMeshes } from "./tabOptions.mjs";
import * as functions from "./functions.mjs";

export const scene = new TinitialiseScene();
export function loadScene() {
  scene.load();
  const exportedAvatarData = character;
}


const checkBtn = document.getElementById("checkBtn");
checkBtn.addEventListener("click", async () => {
  //const avatarImage = scene.saveImg('imgCanvas');
  const avatarData = character.save();

  try {
    const response = await functions.fetchWrapper('POST', "user/avatar", avatarData);
    if (response.ok) {
      //do the correct things
    } else {
      //write error messages form server
    }
  } catch (error) {
    functions.displayErrorMsg();
  }
});

const menuOptions = document.querySelectorAll("[menuOption]");


document.addEventListener("DOMContentLoaded", function () {
  if (menuOptions.length > 0) {
    setupOptionsMenu(menuOptions[0]);
  }
  menuOptions.forEach((option) => {
    option.addEventListener("click", function (event) {
      event.stopPropagation(); // Stop the click event from bubbling up
      setupOptionsMenu(this);
    });
  });

});


function setupOptionsMenu(menuOption) {
  const menuOptionValue = menuOption.getAttribute("menuOption");
  const jsonFile = menuOption.getAttribute("jsonFile");

  while (colorSelector.firstChild) {
    colorSelector.removeChild(colorSelector.firstChild);
  }

  // Initialize color or meshes based on JSON file
  if (jsonFile != null && jsonFile != "meshCategories") {
    showColors(menuOptionValue, jsonFile);
  } else if (jsonFile == "meshCategories") {
    showMeshes(jsonFile, menuOptionValue);
  } else {
    console.log("anError");
  }
}
const parentTabs = document.querySelectorAll(".tab");
const allHiddenTabs = document.querySelectorAll(".hidden-tab");
parentTabs.forEach((parentTab) => {
  parentTab.addEventListener("click", function () {
    const parentId = this.id;

    switch (parentId) {
      case "clothesParent":
        character.position.y = 2.2;
        camera.position.z = 8;
        break;
      case "hairParent":
        character.position.y = 0;
        camera.position.z = 6;
        break;
      case "eyeParent":
        character.position.y = 0;
        camera.position.z = 5;
        break;
      case "skinParent":
        character.position.y = 2.2;
        camera.position.z = 8;
        break;
      case "accessoriesParent":
        character.position.y = 0;
        camera.position.z = 8;
        break;
    }
    parentTabs.forEach((tab) => {
      tab.classList.remove("active");
    });
    this.classList.toggle("active");

    allHiddenTabs.forEach((tab) => {
      if (!tab.classList.contains(`${parentId}-hidden-tab`)) {
        tab.style.display = "none";
      } else {
        tab.style.display = tab.style.display != "block" ? "block" : "none"; //tab.style.display is empty string on first click
      }
    });
  });

});

const childrenTabs = document.querySelectorAll(".hidden-tab");
childrenTabs.forEach((childrenTab) => {
  childrenTab.addEventListener("click", function () {
    childrenTabs.forEach((tab) => {
      tab.classList.remove("active");
    });

    this.classList.add("active");
  });
});
 
document.addEventListener("DOMContentLoaded", ()=>{
  const undo = document.getElementById("undo");
  const redo = document.getElementById("redo");
  
  undo.addEventListener("click", () => {
    character.undo();
  });
  redo.addEventListener("click", () => {
    character.redo();
  });
})



