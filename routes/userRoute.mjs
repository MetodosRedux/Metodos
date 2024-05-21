import express, { raw } from "express";
import User from "../modules/user.mjs";
import HTTPCodes from "../modules/httpConstants.mjs";
import { verifyToken, loginVerification } from "../modules/authentication.mjs";
import DBManager from "../modules/storageManager.mjs";
import { generateHash } from "../modules/crypto.mjs";

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
    } else {
      const user = new User();
      user.name = username;
      user.email = email;
      user.pswHash = pswHash;

      await user.save();
      return res.status(HTTPCodes.SuccessfulResponse.Ok).json({ msg: "User created", });
    }

  } catch (error) {
    console.error("Error creating user:", error.message);
    return res.status(HTTPCodes.ClientSideErrorResponse.BadRequest).json({ msg: "Unable to create user resulting in error: " + error.message });
  }
});
/*   -----------LOGIN--------------- */

USER_API.post("/login", loginVerification, async (req, res, next) => {
  try {
    const { token, avatar } = req.tokenData;

    res.status(HTTPCodes.SuccessfulResponse.Ok).json({ msg: "successful login", token, avatar });
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
  const userId = req.tokenResponse.userId;

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
