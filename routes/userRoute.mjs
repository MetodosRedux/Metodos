import express, { raw } from "express";
import User from "../modules/user.mjs";
import HTTPCodes from "../modules/httpConstants.mjs";
import jwt from "jsonwebtoken";
import { verifyToken, isAdmin } from "../modules/authentication.mjs";
import DBManager from "../modules/storageManager.mjs";
import Avatar from "../modules/avatar.mjs";

const USER_API = express.Router();


/*   -----------NEW USER--------------- */
USER_API.post("/", async (req, res, next) => {
  try {
    const { name, email, pswHash } = req.body;

    if (!name || !email || !pswHash) {
      throw new Error("Missing input");
    }

    const exists = await DBManager.getUserByEmail(email);

    if (exists) {
      throw new Error("This email is already in use.");
    }

    let user = new User();
    user.name = name;
    user.email = email;
    user.pswHash = pswHash;

    // Save user to DB
    await user.save();

    res.status(HTTPCodes.SuccessfulResponse.Ok).end();
  } catch (error) {
    console.error("Error creating user:", error.message);
    res
      .status(HTTPCodes.ClientSideErrorResponse.BadRequest)
      .send(error.message)
      .end();
  }next()
});
/*   -----------LOGIN--------------- */

USER_API.post('/Avatar', async (req, res, next) => {
const avatarData = req.body;
  try {
    console.log("AvatarTrue")
    //DBManager.saveAvatar(avatarData);
    res.status(HTTPCodes.SuccessfulResponse.Ok).json({ msg: "Avatar Saved",  });
  } catch (error){
    console.error("Error uploading avatar:", error);
    res.status(HTTPCodes.ServerErrorResponse.InternalError).json({ error: 'Something went wrong uploading avatar' });
  }
})

export default USER_API;
