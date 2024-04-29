import { character } from "./scene.mjs";

const tabMenuOption = document.getElementById("colorSelector");

export async function showColors(aMenuObject, aColorType) {
    try {

        const response = await fetch(`./json/${aColorType}.json`);
        const data = await response.json();
        const options = data.options || {};

        for (const option in options) {
            const color = options[option].hex;

            let colorSelector = document.createElement("div");
            colorSelector.id = option;
            colorSelector.className = "shadow-md p-3 rounded m-2 ratio ratio-1x1 color-selector";
            colorSelector.style.backgroundColor = color;
            colorSelector.style.width = '20%';

            tabMenuOption.appendChild(colorSelector);
            colorSelector.addEventListener("click", () => {
                const prevSelected = document.querySelector('.color-selector.border');
                if (prevSelected) {
                    prevSelected.classList.remove('border', 'border-5');
                }
                colorSelector.classList.add('border', 'border-5');
                character.setColor(aMenuObject, color);
            });
        }

    } catch (error) {
        console.error('Error initializing color selectors:', error);
    }
}

export async function showMeshes(jsonfile, category) {
    try {
        const response = await fetch(`./json/${jsonfile}.json`);
        const data = await response.json();
        const options = data[category];

        for (const option in options) {
            let meshSelected = document.createElement("div");

            meshSelected.className = "shadow-md p-3 rounded m-2 ratio ratio-1x1 mesh-selector";
            meshSelected.style.width = '20%';
            meshSelected.style.backgroundImage = `url('./mediaAvatar/thumbnails/${options[option]}.png')`;
            meshSelected.style.backgroundSize = 'cover';
            meshSelected.style.backgroundPosition = 'center';

            tabMenuOption.appendChild(meshSelected);

            meshSelected.addEventListener("click", () => {
                const prevSelected = document.querySelector('.mesh-selector.border');
                if (prevSelected) {
                    prevSelected.classList.remove('border', 'border-5');
                }
                meshSelected.classList.add('border', 'border-5');
                character.changeMesh(category, options[option]);
            });
        }
    } catch (error) {
        console.error('Error initializing mesh categories:', error);
    }
}