'use strict';
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

export function TinitialiseScene() {

    let renderer;
    const scene = new THREE.Scene();
    const white = 0xffffff;
    const camera = new THREE.PerspectiveCamera(80, 1, 0.1, 100);

    const scenePositionsTab = {
        "clothesParent": { characterY: 2.2, cameraZ: 8 },
        "hairParent": { characterY: 0, cameraZ: 6 },
        "eyeParent": { characterY: 0, cameraZ: 5 },
        "skinParent": { characterY: 2.2, cameraZ: 8 },
        "accessoriesParent": { characterY: 0, cameraZ: 7 }
    };

    //----------------scene objects----------------------
    camera.position.z = 5;
    //-----------------lights------------------
    addLights();
    //--------------- renderer --------------------------

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.id = 'sceneCanvas';
    renderer.domElement.setAttribute('alt', 'sceneCanvas');
    document.body.appendChild(renderer.domElement);
    setConstantAspectRatio();

    //---------------gradient Background & color -----------------------
    const canvas = renderer.domElement;
    const darkModeToggle = document.getElementById("flexSwitchCheckDefault");

    function updateSceneBackground() {
        const canvasStyle = window.getComputedStyle(canvas);
        const canvasBackgroundColor = canvasStyle.backgroundColor;
        const newSceneBackgroundColor = new THREE.Color(canvasBackgroundColor);
        scene.background = newSceneBackgroundColor;
    }

    updateSceneBackground();
    darkModeToggle.addEventListener("change", updateSceneBackground);

    // ------------------ move character -------------------------
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.minAzimuthAngle = degreesToRadians(-45)
    controls.maxAzimuthAngle = degreesToRadians(45)
    controls.minPolarAngle = degreesToRadians(90);
    controls.maxPolarAngle = degreesToRadians(90);

    //-----------------character-------------------------
    character.rotateY(degreesToRadians(-90));
    scene.add(character);

    //----------------localStorage--------------------------------------

    this.updatePositions = function (parentId) {
        const config = scenePositionsTab[parentId];
        if (config) {
            character.position.y = config.characterY;
            camera.position.z = config.cameraZ;
        } else {
            console.error("Unknown parentId:", parentId);
        }
    }

    //-------------functions-------------------------------

    this.saveImg = function (cvsId) {
        const initialCharacterPos = character.position.y;
        const previousBackground = scene.background;

        character.position.y = 0;
        scene.background = null;

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
        imgRenderer.render(scene, tempCamera);

        const imageDataUrl = canvas.toDataURL('image/png');
        character.position.y = initialCharacterPos;
        scene.background = previousBackground;
        return imageDataUrl;
    };

    this.load = function () {

        controls.update();
        renderer.render(scene, camera);
        requestAnimationFrame(this.load.bind(this));

        if (character.isLoaded() === true) {
            const loadingPage = document.getElementById('loadingPage');
            const tabs = document.getElementById("tabsMenu");
            loadingPage.style.display = "none";
            tabs.style.display = "block";
        }
    };

    function setConstantAspectRatio() {
        const canvasWidth = scenePositions.cvsWidth;
        const canvasHeight = scenePositions.cvsHeight;

        renderer.setSize(canvasWidth, canvasHeight);
        camera.aspect = canvasWidth / canvasHeight;
        camera.updateProjectionMatrix();
    }

    function addLights() {
        const directionalLight = new THREE.DirectionalLight(white, 1);
        directionalLight.position.set(10, 10, 10);
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
    }

    function degreesToRadians(degrees) {
        const mathToMultiply = Math.PI / 180;
        const radians = degrees * mathToMultiply;
        return radians;
    }

}