import * as THREE from '../dist/mjs/three.module.js';
import { OrbitControls } from '../dist/mjs/OrbitControls.js';
import { TCharacter } from "./characterClass.mjs";

export const scenePositions = {
    x: 0,
    y: 0,
    z: 0,
    cvsWidth: window.innerWidth,
    cvsHeight: window.innerHeight,
}

export const character = new TCharacter();

export class TinitialiseScene {

    #renderer;
    #scene = new THREE.Scene();
    #white = 0xffffff;
    #camera = new THREE.PerspectiveCamera(80, 1, 0.1, 100);
    #darkModeToggle;
    #canvas;
    #controls;

    #scenePositionsTab = {
        "clothesParent": { characterY: 2.2, cameraZ: 8 },
        "hairParent": { characterY: 0, cameraZ: 6 },
        "eyeParent": { characterY: 0, cameraZ: 5 },
        "skinParent": { characterY: 2.2, cameraZ: 8 },
        "accessoriesParent": { characterY: 0, cameraZ: 7 }
    };

    constructor() {
        this.#initializeElements();
    }

    #initializeElements() {
        this.#camera.position.z = 5;
        this.#addLights();

        this.#renderer = new THREE.WebGLRenderer({ antialias: true });
        this.#renderer.shadowMap.enabled = true;
        this.#renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.#renderer.domElement.id = 'sceneCanvas';
        this.#renderer.domElement.setAttribute('alt', 'sceneCanvas');
        document.body.appendChild(this.#renderer.domElement);

        this.#canvas = this.#renderer.domElement;
        this.#setConstantAspectRatio();
        this.#updateSceneBackground();

        this.#darkModeToggle = document.getElementById("flexSwitchCheckDefault");
        this.#darkModeToggle.addEventListener("change", this.#updateSceneBackground.bind(this));

        character.rotateY(this.#degreesToRadians(-90));
        this.#scene.add(character);

        this.#controls = new OrbitControls(this.#camera, this.#renderer.domElement);
        this.#controls.minAzimuthAngle = this.#degreesToRadians(-45);
        this.#controls.maxAzimuthAngle = this.#degreesToRadians(45);
        this.#controls.minPolarAngle = this.#degreesToRadians(90);
        this.#controls.maxPolarAngle = this.#degreesToRadians(90);
    }

    #updateSceneBackground() {
        if (!(this.#canvas instanceof Element)) {
            throw new Error("#canvas is not a valid DOM element");
        }
        const canvasStyle = window.getComputedStyle(this.#canvas);
        const canvasBackgroundColor = canvasStyle.backgroundColor;
        const newSceneBackgroundColor = new THREE.Color(canvasBackgroundColor);
        this.#scene.background = newSceneBackgroundColor;
    }

    updatePositions(parentId) {
        const config = this.#scenePositionsTab[parentId];
        if (config) {
            character.position.y = config.characterY;
            this.#camera.position.z = config.cameraZ;
        } else {
            console.error("Unknown parentId:", parentId);
        }
    }

    //-------------functions-------------------------------

    saveImg(cvsId) {
        const initialCharacterPos = character.position.y;
        const previousBackground = this.#scene.background;

        character.position.y = 0;
        this.#scene.background = null;

        const canvas = document.getElementById(cvsId);

        if (!canvas) {
            console.error(`Canvas with ID ${cvsId} not found.`);
            return;
        }
        const imgRenderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
        imgRenderer.setClearColor(0xffffff, 0);
        imgRenderer.shadowMap.enabled = true;
        imgRenderer.shadowMap.type = THREE.PCFSoftShadowMap;

        const width = canvas.width;
        const height = canvas.height;
        imgRenderer.setSize(width, height);
        imgRenderer.setViewport(0, 0, width, height);

        const tempCamera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
        tempCamera.position.z = 5;
        tempCamera.position.y = -0.5;
        imgRenderer.render(this.#scene, tempCamera);

        const imageDataUrl = canvas.toDataURL('image/png');
        character.position.y = initialCharacterPos;
        this.#scene.background = previousBackground;
        return imageDataUrl;
    };

    load() {
        this.#controls.update();
        this.#renderer.render(this.#scene, this.#camera);
        requestAnimationFrame(this.load.bind(this));

        if (character.isLoaded() === true) {
            const loadingPage = document.getElementById('loadingPage');
            const tabs = document.getElementById("tabsMenu");
            loadingPage.style.display = "none";
            tabs.style.display = "block";
        }
    }

    #setConstantAspectRatio() {
        const canvasWidth = scenePositions.cvsWidth;
        const canvasHeight = scenePositions.cvsHeight;

        this.#renderer.setSize(canvasWidth, canvasHeight);
        this.#camera.aspect = canvasWidth / canvasHeight;
        this.#camera.updateProjectionMatrix();
    }

    #addLights() {
        const directionalLight = new THREE.DirectionalLight(this.#white, 1);
        directionalLight.position.set(10, 10, 10);
        directionalLight.castShadow = true;
        this.#scene.add(directionalLight);

        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
    }

    #degreesToRadians(degrees) {
        const mathToMultiply = Math.PI / 180;
        const radians = degrees * mathToMultiply;
        return radians;
    }

}
