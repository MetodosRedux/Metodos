import DBManager from "./storageManager.mjs";

//update code so it fits our possibilities

class User {
  constructor() {
    this.email;
    this.pswHash;
    this.username;
    this.avatar;
    this.id;
    this.lastLogin;
  }

  async save() {
    try {
      if (this.id == null) {
        return await DBManager.createUser(this);
      } else {
        return await DBManager.updateUser(this);
      }
    } catch (error) {
      console.error("Error saving/updating user:", error);
      throw error;
    }
  }

  delete() {
    try {
      DBManager.deleteUser(this);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  }
}

export default User;
