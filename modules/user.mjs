import DBManager from "./storageManager.mjs";

class User {
  constructor() {
    this.email = null;
    this.pswHash = null;
    this.name = null;
    this.id = null;
    this.avatar = null;
    this.lastLogin = null;
  }

  async save() {
    try {
      return await DBManager.createUser(this);
      
    } catch (error) {
      console.error("Error saving user:", error);
      throw error;
    }
  }
}

export default User;
