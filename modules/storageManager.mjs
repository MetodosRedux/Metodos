import pg from "pg";
import { generateHash } from "./crypto.mjs";
import dotenv from 'dotenv'
dotenv.config() 

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
    console.log(client);

    try {
      await client.connect();
      const output = await client.query(
        'INSERT INTO "public"."user"("username", "email", "password") VALUES($1::Text, $2::Text, $3::Text) RETURNING id;',
        [user.name, user.email, user.pswHash]
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

  async saveAvatar(avatarData, userId) {
    const client = new pg.Client(this.#credentials);

    try {
      client.connect();
      const output = await client.query(
        `UPDATE "public"."user" SET "avatar" = $1  WHERE "id" = $2`, [avatarData, userId]);
    }
    catch (error) {
      console.error("could not save Avatar to Database. Error: " + error);
      throw error;
    }
  }

  async getAvatar(userId) {
    const client = new pg.Client(this.#credentials);

    try {
      client.connect();
      const output = await client.query(`SELECT "avatar" FROM "public"."user" WHERE "id" = $1;`, [userId]);
      return output.rows[0];
    } catch (error) {
      console.error("could not save Avatar to Database. Error: " + error);
      throw error;
    }
  }

  async getUserByIdentifier(anIdetifyer) {
    const client = new pg.Client(this.#credentials);
    console.log(client);
    try {
      await client.connect();
      let user = null;

      // Check if anIdetifyer is a valid integer
      if (/^\d+$/.test(anIdetifyer)) {
        const outputId = await client.query(`SELECT * FROM public."user" WHERE "id" = $1`, [anIdetifyer]);

        if (outputId.rows.length === 1) {
          user = outputId.rows[0];
        }
      } else {
        const outputEmail = await client.query(`SELECT * FROM public."user" WHERE "email" = $1`, [anIdetifyer]);

        if (outputEmail.rows.length >= 1) {
          user = outputEmail.rows[0];
        }
      }

      return user;
    } catch (error) {
      console.error(`Error getting user by identifyer ${anIdetifyer}:`, error);
      throw error;
    } finally {
      await client.end();
    }
  }


  async getUserByEmailAndPassword(email, pswHash) {
    const client = new pg.Client(this.#credentials);

    try {
      await client.connect();
      const output = await client.query(
        'SELECT * FROM "public"."user" WHERE email = $1 AND "password" = $2',
        [email, pswHash]
      );

      if (output.rows.length > 0) {
        const user = output.rows[0];

        const now = new Date();
        await client.query(
          'UPDATE "public"."user" SET "lastlogin" = $1 WHERE id = $2',
          [now, user.id]
        );
      }
      return output.rows[0];
    } catch (error) {
      console.error("Error fetching user by email and password:", error);
      throw error;
    } finally {
      client.end();
    }
  }
}

let connectionString =
  process.env.ENVIRONMENT == "local"
    ? process.env.DB_CONNECTIONSTRING_LOCAL
    : process.env.DB_CONNECTIONSTRING_PROD;

export default new DBManager(connectionString);
