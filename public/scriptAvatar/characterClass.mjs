"use strict";
import { GLTFLoader } from "../dist/mjs/GLTFLoader.js";
import { DRACOLoader } from "../dist/mjs/DRACOLoader.js";
import * as THREE from "../dist/mjs/three.module.js";
import { scenePositions } from "./scene.mjs";


export class TCharacter extends THREE.Object3D {
  #bodyParts;
  #allMoves;
  #currentIndex;
  #loaded;
  #gltfModel;
  #localAvatarData
  constructor() {
    super();

    this.#bodyParts = null;
    this.#allMoves = [];
    this.#currentIndex = -1;
    this.#loaded = false;
    this.#gltfModel = null;
    this.#localAvatarData = JSON.parse(localStorage.getItem("avatar"));

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("../dist/mjs/draco/");
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    loader.load("./mediaAvatar/character/avatar.gltf", (gltfModel) => {
      this.#gltfModel = gltfModel;

      gltfModel.scene.position.set(
        scenePositions.x,
        scenePositions.y,
        scenePositions.z
      );
      this.add(gltfModel.scene);

      const lights = gltfModel.scene.children.filter((child) => child.isLight);

      lights.forEach((light) => {
        light.intensity = 40;
      });

      this.#locateAllMeshes(gltfModel.scene);
      
    });

    if (this.#localAvatarData != null ) {
      this.#bodyParts = this.#localAvatarData;
    } else {
      this.#bodyParts = {
        eye: { name: "eyes", color: "#CEE2FF" },
        hair: { name: null, color: "#6B4F39" },
        eyebrow: { name: "eyebrow_hairier", color: "#6B4F39" },
        skin: { name: "skin", color: "#FFE7C0" },
        shirt: { name: "shirt_hoodie", color: "#99C1FC" },
        pants: { name: "pants_jogging", color: "#B09881" },
        shoes: { name: "shoes_sneakers", color: "#B07947" },
        glasses: { name: null },
        earring: { name: null, color: "#CDAA35" },
        necklace: { name: null, color: "#CDAA35" },
        accessories: { name: null, color: "#CDAA35" },
        beard: { name: null, color: "#6B4F39" },
      };
    }
  }

  #locateMeshToPhong(aMeshName) {
    let mesh = this.#gltfModel.scene.children.find(
      (child) => child.name === aMeshName
    );
    const childMesh = mesh.children[0];

    if (childMesh) {
      mesh = childMesh;
    }

    const phongMaterial = new THREE.MeshPhongMaterial();
    phongMaterial.color.copy(mesh.material.color);
    phongMaterial.map = mesh.material.map;
    phongMaterial.normalMap = mesh.material.normalMap;
    phongMaterial.normalScale.copy(mesh.material.normalScale);
    phongMaterial.receiveShadow = true;
    if (
      mesh.name.startsWith(this.#bodyParts.accessories.name) ||
      mesh.name.startsWith(this.#bodyParts.necklace.name) ||
      mesh.name.startsWith(this.#bodyParts.earring.name)
    ) {
      phongMaterial.specular.set(0xffffff);
      phongMaterial.shininess = 20;
    }
    mesh.material = phongMaterial;
    return mesh;
  }

  #saveSteps() {
    this.#currentIndex++;
    this.#allMoves.push(JSON.parse(JSON.stringify(this.#bodyParts)));
    if (this.#currentIndex > 11) {
      this.#allMoves.shift();
      this.#currentIndex--;
    }
  }

  setColor(aMeshCategory, aColor) {
    const locatedMesh = this.#locateMeshToPhong(
      this.#bodyParts[aMeshCategory].name
    );
    this.#bodyParts[aMeshCategory].color = aColor;
    locatedMesh.material.color.set(aColor);
    this.#saveSteps();
  }

  undo() {
    if (this.#currentIndex > 0) {
      this.#currentIndex--;
      const stepToShow = this.#allMoves[this.#currentIndex];
      const stepToDelete = this.#allMoves[this.#currentIndex + 1];
      this.#setMesh(this.#gltfModel.scene, stepToDelete, false);
      this.#setMesh(this.#gltfModel.scene, stepToShow);
      this.#bodyParts = stepToShow;
    } else {
      console.log("Cannot undo any further.");
    }
  }

  redo() {
    if (this.#currentIndex < this.#allMoves.length - 1) {
      this.#currentIndex++;
      const stepToShow = this.#allMoves[this.#currentIndex];
      const stepToDelete = this.#allMoves[this.#currentIndex - 1];
      this.#setMesh(this.#gltfModel.scene, stepToDelete, false);
      this.#setMesh(this.#gltfModel.scene, stepToShow);
      this.#bodyParts = stepToShow;
    } else {
      console.log("Cannot redo any further.");
    }
  }

  save() {
    return this.#bodyParts;
  }

  returnLastColor(aMeshCategory) {
    return this.#bodyParts[aMeshCategory].color;
  }

  changeMesh(category, name) {
    const childWithName = this.#gltfModel.scene.children.find(
      (child) => child.name === this.#bodyParts[category].name
    );
    if (childWithName) {
      childWithName.visible = false;
    }
    this.#bodyParts[category].name = name;
    this.#setMesh(this.#gltfModel.scene, this.#bodyParts);
    this.setColor(category, this.#bodyParts[category].color);
  }

  isLoaded() {
    if (this.#loaded === true) {
      return true;
    }
  }

  #locateAllMeshes(scene) {
    const meshCategories = {};

    for (const categoryName in this.#bodyParts) {
      if (this.#bodyParts.hasOwnProperty(categoryName)) {
        const processedMeshes = new Set();
        scene.children.forEach((child) => {
          if (
            child.name.startsWith(categoryName) &&
            !processedMeshes.has(child)
          ) {
            const options = {};
            let optionCounter = 1;
            let currentChild = child;
            do {
              options[`option${optionCounter++}`] = currentChild.name;
              processedMeshes.add(currentChild);
              currentChild.visible = false;
              currentChild = scene.children.find(
                (nextChild) =>
                  nextChild !== currentChild &&
                  nextChild.name.startsWith(categoryName) &&
                  !processedMeshes.has(nextChild)
              );
            } while (currentChild);
            meshCategories[categoryName] = options;
          }
        });
      }
    }
    //this.#saveMeshCategoriesToFile(meshCategories, 'meshes');

    this.#setMesh(scene, this.#bodyParts);
  }

  #setMesh(scene, aMeshObject, boolVisability = true) {
    for (const category in aMeshObject) {
      if (aMeshObject.hasOwnProperty(category)) {
        const childName = aMeshObject[category].name;

        const child = scene.children.find((child) => child.name === childName);

        if (child) {
          child.visible = boolVisability;
          const locatedMesh = this.#locateMeshToPhong(childName);
          locatedMesh.material.color.set(aMeshObject[category].color);
        }
      }
    }
    this.#loaded = true;
  }

  //uncomment the instance if anything changes in the GLTF file so the meshCategories.json is updated
  #saveMeshCategoriesToFile(meshCategories, fileName) {
    const jsonData = JSON.stringify(meshCategories, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }
}
