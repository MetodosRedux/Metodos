import { character } from "./scene.mjs";

const tabMenuOption = document.getElementById("colorSelector");

export async function showColors(aMenuObject, aMenuCategory, aColorType) {
    while (tabMenuOption.firstChild) {
        tabMenuOption.removeChild(tabMenuOption.firstChild);
    }

    try {
        const response = await fetch(`./json/${aColorType}.json`);
        const data = await response.json();
        const options = data[aMenuCategory] || {};
        
        let lastColor = character.returnLastColor(aMenuObject);

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
                lastColor = character.returnLastColor(aMenuObject);
                colorPicker.value = lastColor;
            });
        }

        const colorPicker = document.createElement('input');
        colorPicker.type = 'color';
        colorPicker.id = 'colorPicker';
        colorPicker.name = 'colorPicker';
        colorPicker.value = lastColor; 

        const colorPickerWrapper = document.createElement('div');
        colorPickerWrapper.className = 'color-picker-wrapper';

        colorPickerWrapper.appendChild(colorPicker);
        
        tabMenuOption.appendChild(colorPickerWrapper);

        colorPicker.addEventListener('input', function (event) {
            const hexColor = event.target.value;
            character.setColor(aMenuObject, hexColor);
        });

    } catch (error) {
        console.error('Error initializing color selectors:', error);
    }
}

export async function showMeshes(jsonFile, category) {
    try {
        const response = await fetch(`./json/${jsonFile}.json`);
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