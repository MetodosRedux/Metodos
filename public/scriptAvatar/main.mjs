"use strict";
import { TinitialiseScene, character } from "./scene.mjs";
import {setupOptionsMenu} from "./tabOptions.mjs";
import * as functions from "./functions.mjs";

export const scene = new TinitialiseScene();
export function loadScene() {
  scene.load();
}

const parentTabs = document.querySelectorAll(".tab");
const allHiddenTabs = document.querySelectorAll(".hidden-tab");
const checkBtn = document.getElementById("checkBtn");
const allTabs = document.querySelectorAll('.tab, .hidden-tab');
const menuOptions = document.querySelectorAll("[data-menuOption]");
const childrenTabs = document.querySelectorAll(".hidden-tab");


/*-------------- events ----------------- */

checkBtn.addEventListener("click", async () => {
  const formData = new FormData();
  const avatarData = JSON.stringify(character.save());
  const imageData = scene.saveImg('imgCanvas')

  formData.append("imageDataUrl", imageData);
  formData.append("avatarData", avatarData);

  try {
    const response = await functions.fetchWrapper('POST', "user/avatar", formData);
    const data = await response.json();
    if (response.ok) {

      localStorage.setItem("avatar", data.avatarData);
      location.href = "game/index.html";
      functions.printResponse(data.msg);
    }else {
      functions.printResponse(data.msg);
    }
  } catch (error) {
    functions.displayErrorMsg(error);
  }
});

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

parentTabs.forEach((parentTab) => {
  parentTab.addEventListener("click", function () {
    const parentId = this.id;

    scene.updatePositions(parentId);

    parentTabs.forEach((tab) => {
      tab.classList.remove("active");
    });

    this.classList.toggle("active");

    allHiddenTabs.forEach((tab) => {
      if (!tab.classList.contains(`${parentId}-hidden-tab`)) {
        tab.style.display = "none";
      } else {
        tab.style.display = tab.style.display != "block" ? "block" : "none";
      }
    });
  });
});

allTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const parentContainer = tab.parentNode;
    const parentWidth = parentContainer.clientWidth;
    const scrollLeft = parentContainer.scrollLeft;
    const tabOffsetLeft = tab.offsetLeft;

    let scrollTo = tabOffsetLeft - scrollLeft;

    if (scrollTo + tab.offsetWidth > parentWidth) {
      scrollTo = tabOffsetLeft + tab.offsetWidth - parentWidth;
    }

    parentContainer.scrollTo({
      left: scrollLeft + scrollTo,
      behavior: 'smooth'
    });
  });
});

childrenTabs.forEach((childrenTab) => {
  childrenTab.addEventListener("click", function () {
    childrenTabs.forEach((tab) => {
      tab.classList.remove("active");
    });

    this.classList.add("active");
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const undo = document.getElementById("undo");
  const redo = document.getElementById("redo");

  undo.addEventListener("click", () => {
    character.undo();
  });
  redo.addEventListener("click", () => {
    character.redo();
  });
})

/*-------------- functions ----------------- */ 





