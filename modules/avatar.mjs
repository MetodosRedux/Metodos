import DBManager from "./storageManager.mjs";
import jwt from "jsonwebtoken";

class Avatar {
  constructor() {
    this.avatarData
  }

  async save() {
    if (this.avatarData !== null) {
      return await DBManager.saveAvatar(this);
    }else {
      return await DBManager.updateAvatar(this)
    }
  }
}

export default Avatar;
