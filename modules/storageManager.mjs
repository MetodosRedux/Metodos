import pg from "pg";
import { generateHash } from "./crypto.mjs";

class DBManager {
  #credentials = {};

  constructor(connectionString) {
    this.#credentials = {
      connectionString,
      ssl: process.env.DB_SSL === "true" ? process.env.DB_SSL : false,
    };
  }

  async createUser(user) {
    const client = new pg.Client(this.#credentials);

    try {
      user.pswHash = generateHash(user.pswHash);
      await client.connect();
      const output = await client.query(
        'INSERT INTO "public"."user"("username", "email", "pswHash") VALUES($1::Text, $2::Text, $3::Text) RETURNING id;',
        [user.username, user.email, user.pswHash]
      );

      if (output.rows.length == 1) {
        user.id = output.rows[0].id;
      }
    } catch (error) {
      console.error(error);
    } finally {
      client.end(); // Always disconnect from the database.
    }

    return user;
  }

  async updateUser(name, email, pswHash, userId) {
    const client = new pg.Client(this.#credentials);

    try {
      await client.connect();
      const queryParams = [name, email];

      // Check if a new password is provided
      if (pswHash !== undefined) {
        pswHash = generateHash(pswHash);
        queryParams.push(pswHash);
      }

      queryParams.push(userId);

      const output = await client.query(
        'UPDATE "public"."Users" SET "name" = $1, "email" = $2' +
          (pswHash !== undefined ? ', "pswHash" = $3' : "") +
          " WHERE id = $" +
          (pswHash !== undefined ? "4" : "3") +
          "  RETURNING *",
        queryParams
      );

      if (output.rows.length > 0) {
        const updatedUser = output.rows[0];
        return updatedUser;
      } else {
        throw new Error("User not found or not updated");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    } finally {
      client.end(); // Always disconnect from the database.
    }
  }

  async deleteUser(userId) {
    const client = new pg.Client(this.#credentials);

    try {
      await client.connect();
      await client.query('Delete from "public"."Users"  where id = $1;', [
        userId,
      ]);
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    } finally {
      client.end();
    }
  }

  async updateLightMode(lightmode, userId) {
    const client = new pg.Client(this.#credentials);

    try {
      await client.connect();

      const lightmodeOutput = await client.query(
        'UPDATE "public"."Users" SET "lightmode" = $1 WHERE id = $2 RETURNING *',
        [lightmode, userId]
      );
      const lightmodeUpdate = lightmodeOutput.rows[0];
      return { lightmode, lightmodeUpdate };
    } catch (error) {
      console.error("Error saving lightmode choice:", error);
      throw error;
    } finally {
      client.end(); // Always disconnect from the database.
    }
  }

  async getUserByEmail(email) {
    const client = new pg.Client(this.#credentials);

    try {
      await client.connect();

      const output = await client.query(
        'SELECT * FROM "public"."user" WHERE email = $1',
        [email]
      );

      return output.rows[0];
    } catch (error) {
      console.error("Error getting user by email:", error);
      throw error;
    } finally {
      client.end();
    }
  }

  async getUserByEmailAndPassword(email, pswHash) {
    const client = new pg.Client(this.#credentials);

    try {
      await client.connect();
      pswHash = generateHash(pswHash);
      const output = await client.query(
        'SELECT * FROM "public"."user" WHERE email = $1 AND "pswHash" = $2',
        [email, pswHash]
      );

     /* if (output.rows.length > 0) {
          const user = output.rows[0];

       const now = new Date();
        await client.query(
          'UPDATE "public"."user" SET "lastLogin" = $1 WHERE id = $2',
          [now, user.id]
        ); 
      }*/
      return output.rows[0];
    } catch (error) {
      console.error("Error fetching user by email and password:", error);
      throw error;
    } finally {
      client.end();
    }
  }

  async getUserById(userId) {
    const client = new pg.Client(this.#credentials);

    try {
      await client.connect();

      const output = await client.query(
        'SELECT * FROM "public"."user" WHERE id = $1',
        [userId]
      );

      return output.rows[0];
    } catch (error) {
      console.error("Error getting user by ID:", error);
      throw error;
    } finally {
      client.end();
    }
  }

  async getAllUsers() {
    const client = new pg.Client(this.#credentials);

    try {
      await client.connect();

      const output = await client.query('SELECT * FROM public."Users"');

      return output.rows;
    } catch (error) {
      console.error("cant get all users:", error);
      throw error;
    } finally {
      client.end();
    }
  }

  async updateUserRole(userId, role) {
    const client = new pg.Client(this.#credentials);

    try {
      await client.connect();

      const output = await client.query(
        'UPDATE "public"."Users" SET "role" = $1 WHERE id = $2 RETURNING *',
        [role, userId]
      );

      if (output.rows.length > 0) {
        const updatedUser = output.rows[0];
        return updatedUser;
      } else {
        throw new Error("User not found or not updated");
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      throw error;
    } finally {
      client.end(); // Always disconnect from the database.
    }
  }

  async getAvatar(avatar) {
    const client = new pg.Client(this.#credentials);

    try {
      await client.connect();

      const output = await client.query(
        'SELECT * FROM "public"."user" WHERE id = $1',
        [avatar]
      );

      return output.rows[0];
    } catch (error) {
      console.error("Error getting avatar id:", error);
      throw error;
    } finally {
      client.end();
    }
  }

  async saveAvatar(userAvatar,userId) {
    const client = new pg.Client(this.#credentials);

    try {
      await client.connect();

      const avatarOutput = await client.query(
        'UPDATE "public"."user" SET "avatar" = $1 WHERE id = $2 RETURNING "avatar"',
        [userAvatar,userId]
      );

      const avatarData = avatarOutput.rows[0];

      /* const userOutput = await client.query(
        'UPDATE "public"."Users" SET "avatar_id" = $1 WHERE id = $2 RETURNING *',
        [avatarId, userId]
      ); 
      const userUpdate = userOutput.rows[0];*/
      return { avatarData};
    } catch (error) {
      console.error("Error saving Avatar:", error);
      throw error;
    } finally {
      client.end(); // Always disconnect from the database.
    }
  }

  async updateAvatar(avatarInfo) {
    const client = new pg.Client(this.#credentials);
    let eyeColor = avatarInfo.eyeColor
    let skinColor = avatarInfo.skinColor
    let hairColor = avatarInfo.hairColor
    let eyebrowType = avatarInfo.eyebrowType
    let avatarId = avatarInfo.id
    try {
      await client.connect();

      const avatarUpdate = await client.query(
        'UPDATE "public"."Avatar" SET "eyeColor" = $1, "skinColor" = $2, "hairColor" = $3, "eyebrowType" = $4 WHERE "id" = $5 RETURNING id',
        [eyeColor, skinColor, hairColor, eyebrowType, avatarId]
      );
      

      const avatarResponse = avatarUpdate.rows[0].id;


      return  avatarResponse
    } catch (error) {
      console.error("Error updating Avatar:", error);
      throw error;
    } finally {
      client.end(); // Always disconnect from the database.
    }
  }

}

let connectionString =
  process.env.ENVIRONMENT == "local"
    ? process.env.DB_CONNECTIONSTRING_LOCAL
    : process.env.DB_CONNECTIONSTRING_PROD;

export default new DBManager(connectionString);
