import DBManager from "./storageManager.mjs";
import jwt from "jsonwebtoken";

class Avatar {
  /* constructor() {
    this.hairColor;
    this.eyeColor;
    this.skinColor;
    this.eyebrowType;
    this.id;
  } */

  async save() {
    if (this.id == null) {
      return await DBManager.saveAvatar(this);
    }else {
      return await DBManager.updateAvatar(this)
    }
  }
}

export default Avatar;
