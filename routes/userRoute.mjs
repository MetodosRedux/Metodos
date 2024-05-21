import express from "express";
import User from "../modules/user.mjs";
import HTTPCodes from "../modules/httpConstants.mjs";
import { verifyToken, loginVerification } from "../modules/authentication.mjs";
import DBManager from "../modules/storageManager.mjs";
import { generateHash } from "../modules/crypto.mjs";
import multer from "multer";
import fs from "fs"


const USER_API = express.Router();
const upload = multer()
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
    res.status(HTTPCodes.ClientSideErrorResponse.Unauthorized).send(error.message);
  } next()
});

/* -------------AVATAR----------------- */

USER_API.post('/avatar', verifyToken, upload.none(), async (req, res, next) => {
  const avatarData = req.body.avatarData;
  const imageData = req.body.imageDataUrl
  const userId = req.tokenResponse.userId;

  const base64Data = imageData.split(',')[1];

  // Convert base64-encoded data to a buffer
  const binaryData = Buffer.from(base64Data, 'base64');
  

  const filename = `${userId}.png`;
  const filePath = `./userProfilePictures/${filename}`;

  // Write the image data to a PNG file
  fs.writeFileSync(filePath, binaryData, 'binary');

  try {
    console.log("AvatarTrue")
    DBManager.saveAvatar(avatarData, userId);
    res.status(HTTPCodes.SuccessfulResponse.Ok).json({ msg: "Avatar Saved", });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    res.status(HTTPCodes.ServerErrorResponse.InternalError).json({ error: 'Something went wrong uploading avatar' });
  }
})

USER_API.get("/game/id", verifyToken, async (req, res, next) => {
  try {
    const userId = req.tokenResponse.userId;
    if(userId !== null){
      res.status(HTTPCodes.SuccessfulResponse.Ok).json({msg: "user found",userId : userId});
    }else {
      res.status(HTTPCodes.ClientSideErrorResponse.NotFound).json({msg: "could not find a user with this id"});
    }

  } catch (error) {
    console.error("Couldn't find id for profile picture: ", error.message);
    res.status(HTTPCodes.ClientSideErrorResponse.NotFound).json({ error: "Couldn't find id for profile picture" });
  } next()
});

export default USER_API;
