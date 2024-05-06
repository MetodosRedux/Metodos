'use strict';
import * as THREE from '../dist/mjs/three.module.js';
import { OrbitControls } from '../dist/mjs/OrbitControls.js';
import { TCharacter } from "./characterClass.mjs";


export const avatarFeatures = {
    skinColor: null,
    hairColor: null,
    eyeColor: null,
    browType: null,
    loggedInUser: null,
}

export const scenePositions = {
    x: 0,
    y: 0,
    z: 0,
    cvsWidth: window.innerWidth,
    cvsHeight: window.innerHeight,
}

export const character = new TCharacter();
export const camera = new THREE.PerspectiveCamera(80, 1, 0.1, 100);


function degreesToRadians(degrees) {
    const mathToMultiply = Math.PI / 180;
    const radians = degrees * mathToMultiply;
    return radians;
}

export function TinitialiseScene() {

    let renderer;
    const scene = new THREE.Scene();

    const white = 0xffffff;

    //----------------scene objects----------------------
    camera.position.z = 5;
    //-----------------lights------------------

    addLights();

    //--------------- renderer --------------------------
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    //renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.id = 'sceneCanvas';
    renderer.domElement.setAttribute('alt', 'sceneCanvas');
    document.body.appendChild(renderer.domElement);
    setConstantAspectRatio();
    //---------------gradient Background & color -----------------------
    const canvas = renderer.domElement;

    // Retrieve the dark mode toggle button
    const darkModeToggle = document.getElementById("flexSwitchCheckDefault");
    
    // Function to update the scene background based on the canvas background color
    function updateSceneBackground() {
        // Get the updated computed style of the canvas
        const canvasStyle = window.getComputedStyle(canvas);
        
        // Retrieve the background color of the canvas
        const canvasBackgroundColor = canvasStyle.backgroundColor;
        
        // Convert the background color of the canvas to a THREE.Color instance
        const newSceneBackgroundColor = new THREE.Color(canvasBackgroundColor);
        
        // Set the scene background to the new color
        scene.background = newSceneBackgroundColor;
    }
    
    // Initial scene background setup
    updateSceneBackground();
    
    // Add a change event listener to the dark mode toggle button
    darkModeToggle.addEventListener("change", updateSceneBackground);
    // ------------------ move character -------------------------
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.minAzimuthAngle = degreesToRadians(-45) // 45 degrees left
    controls.maxAzimuthAngle = degreesToRadians(45) // 45 degrees right
    controls.minPolarAngle = degreesToRadians(90);//no upwards/downwards
    controls.maxPolarAngle = degreesToRadians(90);

    //-----------------character-------------------------
    character.rotateY(degreesToRadians(-90));
    scene.add(character);

    //----------------localStorage--------------------------------------


    //-------------functions-------------------------------

    this.saveImg = function (cvsId) {
        const initialCharacterPos = character.position.y;
        character.position.y = 0;
        const canvas = document.getElementById(cvsId);

        if (!canvas) {
            console.error(`Canvas with ID ${cvsId} not found.`);
            return;
        }
        const imgRenderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
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

        const imageDataUrl = canvas.toDataURL('image/png'); //add this to the server 
        const downloadLink = document.createElement('a');
        downloadLink.href = imageDataUrl;
        downloadLink.download = 'rendered_image.png';
        downloadLink.click();
        character.position.y = initialCharacterPos;
    };

    this.load = function () {
        requestAnimationFrame(this.load.bind(this));
        controls.update();
        renderer.render(scene, camera);
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
        directionalLight.castShadow = true; // Enable shadow casting
        scene.add(directionalLight);

        // Configure shadow properties
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
    }

}