"use strict"
import { GLTFLoader } from "../dist/mjs/GLTFLoader.js";
import { DRACOLoader } from "../dist/mjs/DRACOLoader.js";
import * as THREE from '../dist/mjs/three.module.js';
import { scenePositions } from "./scene.mjs";


export class TCharacter extends THREE.Object3D {
    constructor() {
        super();

        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('../dist/mjs/draco/');
        const loader = new GLTFLoader();
        loader.setDRACOLoader(dracoLoader);

        let bodyParts = {
            eye: { name: 'eyes', color: "#CEE2FF" },
            hair: { name: null, color: "#6B4F39" },
            eyebrow: { name: "eyebrow_hairier", color: "#6B4F39" },
            skin: { name: 'skin', color: "#FFE7C0" },
            shirt: { name: 'shirt_hoodie', color: "#99C1FC" },
            pants: { name: 'pants_jogging', color: "#B09881" },
            shoes: { name: 'shoes_sneakers', color: "#B07947" },
            glasses: { name: null },
            earring: { name: null, color: "#CDAA35" },
            necklace: { name: null, color: "#CDAA35" },
            accessories: { name: null, color: "#CDAA35" },
            beard: { name: null, color: "#6B4F39" }
        }

        const allMoves = [];
        let currentIndex = -1; //starts at this so it matches the index in the array

        function saveSteps() {
            currentIndex++;
            allMoves.push(JSON.parse(JSON.stringify(bodyParts)));
            if (currentIndex > 11) {
                allMoves.shift();
                currentIndex--;
            }
        }

        loader.load("./mediaAvatar/character/avatar.gltf", (gltfModel) => {
            gltfModel.scene.position.set(scenePositions.x, scenePositions.y, scenePositions.z);
            this.add(gltfModel.scene);

            function locateMeshToPhong(aMeshName) {
                let mesh = gltfModel.scene.children.find(child => child.name === aMeshName);
                const childMesh = mesh.children[0];

                if (childMesh) {
                    mesh = childMesh
                }

                const phongMaterial = new THREE.MeshPhongMaterial();
                phongMaterial.color.copy(mesh.material.color);
                phongMaterial.map = mesh.material.map;
                phongMaterial.normalMap = mesh.material.normalMap;
                phongMaterial.normalScale.copy(mesh.material.normalScale);
                phongMaterial.receiveShadow = true;
                if (mesh.name.startsWith(bodyParts.accessories.name) || mesh.name.startsWith(bodyParts.necklace.name) || mesh.name.startsWith(bodyParts.earring.name)) {
                    phongMaterial.specular.set(0xffffff);
                    phongMaterial.shininess = 20;
                }
                mesh.material = phongMaterial;
                return mesh;
            }

            console.log(gltfModel.scene);
            console.log(gltfModel.scene.parent.children);
            
            const lights = gltfModel.scene.children.filter(child => child.isLight);

            lights.forEach(light => {
                light.intensity = 40;
            });

            this.setColor = function (aMeshCategory, aColor) {
                const locatedMesh = locateMeshToPhong(bodyParts[aMeshCategory].name);
                bodyParts[aMeshCategory].color = aColor;
                locatedMesh.material.color.set(aColor);
                saveSteps();
            }

            this.undo = function () {
                if (currentIndex > 0) {
                    currentIndex--;
                    const stepToShow = allMoves[currentIndex];
                    const stepToDelete = allMoves[currentIndex + 1];
                    setMesh(gltfModel.scene, stepToDelete, false);
                    setMesh(gltfModel.scene, stepToShow);
                    bodyParts = stepToShow
                } else {
                    console.log('Cannot undo any further.');
                }
            };

            this.redo = function () {
                if (currentIndex < allMoves.length - 1) {
                    currentIndex++;
                    const stepToShow = allMoves[currentIndex];
                    const stepToDelete = allMoves[currentIndex - 1];
                    setMesh(gltfModel.scene, stepToDelete, false);
                    setMesh(gltfModel.scene, stepToShow);
                    bodyParts = stepToShow
                } else {
                    console.log('Cannot redo any further.');
                }
            };

            this.save = function () {
                return bodyParts;
            }

            this.returnLastColor = function (aMeshCategory) {
                return bodyParts[aMeshCategory].color;
            }

            this.changeMesh = function (category, name) {
                const childWithName = gltfModel.scene.children.find(child => child.name === bodyParts[category].name);
                if (childWithName) {
                    childWithName.visible = false;
                }
                bodyParts[category].name = name;
                setMesh(gltfModel.scene, bodyParts);
                this.setColor(category, bodyParts[category].color);
            };

            function locateAllMeshes(scene) {
                const meshCategories = {};

                for (const categoryName in bodyParts) {
                    if (bodyParts.hasOwnProperty(categoryName)) {
                        const processedMeshes = new Set();
                        scene.children.forEach(child => {
                            if (child.name.startsWith(categoryName) && !processedMeshes.has(child)) {
                                const options = {};
                                let optionCounter = 1;
                                let currentChild = child;
                                do {
                                    options[`option${optionCounter++}`] = currentChild.name;
                                    processedMeshes.add(currentChild);
                                    currentChild.visible = false;
                                    currentChild = scene.children.find(nextChild => nextChild !== currentChild && nextChild.name.startsWith(categoryName) && !processedMeshes.has(nextChild));
                                } while (currentChild);
                                meshCategories[categoryName] = options;
                            }
                        });
                    }
                };
                //saveMeshCategoriesToFile(meshCategories, 'meshes');

                setMesh(scene, bodyParts);
            }

            function setMesh(scene, aMeshObject, boolVisability = true) {
                for (const category in aMeshObject) {
                    if (aMeshObject.hasOwnProperty(category)) {
                        const childName = aMeshObject[category].name;

                        const child = scene.children.find(child => child.name === childName);

                        if (child) {
                            child.visible = boolVisability;
                            const locatedMesh = locateMeshToPhong(childName);
                            locatedMesh.material.color.set(aMeshObject[category].color);
                        }
                    }
                }
            }

            function saveMeshCategoriesToFile(meshCategories, fileName) {
                const jsonData = JSON.stringify(meshCategories, null, 2);
                const blob = new Blob([jsonData], { type: 'application/json' });
                const url = URL.createObjectURL(blob);

                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove();
            }

            locateAllMeshes(gltfModel.scene);
        });

    }
}




