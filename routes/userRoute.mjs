import express, { raw } from "express";
import User from "../modules/user.mjs";
import HTTPCodes from "../modules/httpConstants.mjs";
import jwt from "jsonwebtoken";
import { verifyToken, isAdmin } from "../modules/authentication.mjs";
import DBManager from "../modules/storageManager.mjs";
import Avatar from "../modules/avatar.mjs";
import { generateHash } from "../modules/crypto.mjs";
import multer from "multer";


const USER_API = express.Router();

/*   -----------NEW USER--------------- */
USER_API.post("/", async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const pswHash = generateHash(password);

    if (!username || !email || !password) {
      return res.status(HTTPCodes.ClientSideErrorResponse.BadRequest).json({ msg: "Missing input", });
    }

    const exists = await DBManager.getUserByIdentifier(email);

    if (exists) {
      return res.status(HTTPCodes.ClientSideErrorResponse.BadRequest).json({ msg: "This email is already in use.", });
    }

    let user = new User();
    user.username = username;
    user.email = email;
    user.pswHash = pswHash;

    // Save user to DB
    await user.save();

    return res.status(HTTPCodes.SuccessfulResponse.Ok).json({ msg: "User created", });
  } catch (error) {
    console.error("Error creating user:", error.message);
   return res.status(HTTPCodes.ClientSideErrorResponse.BadRequest).json({msg: "Unable to create user resulting in error: " + error.message});
  }
});
/*   -----------LOGIN--------------- */

USER_API.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const secretKey = process.env.SECRET_KEY;
    const pswHash = generateHash(password);
    const user = await DBManager.getUserByEmailAndPassword(email, pswHash);

    if (!user) {
      throw new Error("Wrong password or e-mail address.");
    }

    let tokenPayload = {
      userId: user.id,
      email: user.email,
    };

    /* const userWithAvatar = await DBManager.getUserById(user.id);
    if (userWithAvatar) {
      tokenPayload.avatar_id = userWithAvatar.avatar_id;
    } */

    const token = jwt.sign(tokenPayload, secretKey, { expiresIn: "1h" });

    res.json({ token });
  } catch (error) {
    console.error("Error during login:", error.message);
    res
      .status(HTTPCodes.ClientSideErrorResponse.Unauthorized)
      .send(error.message);
  } next()
});

/* -------------AVATAR----------------- */

USER_API.post('/avatar', verifyToken, async (req, res, next) => {
  const avatarData = req.body;
  const userId = 37;

  try {
    console.log("AvatarTrue")
    DBManager.saveAvatar(avatarData, userId);
    res.status(HTTPCodes.SuccessfulResponse.Ok).json({ msg: "Avatar Saved", });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    res.status(HTTPCodes.ServerErrorResponse.InternalError).json({ error: 'Something went wrong uploading avatar' });
  }
})

export default USER_API;
