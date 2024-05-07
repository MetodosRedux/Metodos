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
    const { username, email, pswHash } = req.body;

    if (!name || !email || !pswHash) {
      throw new Error("Missing input");
    }

    const exists = await DBManager.getUserByEmail(email);

    if (exists) {
      throw new Error("This email is already in use.");
    }

    let user = new User();
    user.username = username;
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

USER_API.post("/login", async (req, res, next) => {
  try {
    const { email, pswHash} = req.body;
    const secretKey = process.env.SECRET_KEY;

    const user = await DBManager.getUserByEmailAndPassword(email, pswHash);
   
    if (!user) {
      throw new Error("Wrong password or e-mail address.");
    }

    let tokenPayload = {
      userId: user.id,
      email: user.email,
    };

    const userWithAvatar = await DBManager.getUserById(user.id);
    if (userWithAvatar) {
      tokenPayload.avatar_id = userWithAvatar.avatar_id;
    }

    const token = jwt.sign(tokenPayload, secretKey, { expiresIn: "1h" });

    res.json({ token });
  } catch (error) {
    console.error("Error during login:", error.message);
    res
      .status(HTTPCodes.ClientSideErrorResponse.Unauthorized)
      .send(error.message);
  }next()
});
/*   -----------EDIT--------------- NOT IN USE*/
USER_API.put("/updateUser", verifyToken, async (req, res, next) => {
  try {
    const { email, pswHash, name } = req.body;
    const userId = req.user.userId;

    const userUpdate = await DBManager.updateUser(
      name,
      email,
      pswHash || undefined,
      userId
    );
    res.status(HTTPCodes.SuccessfulResponse.Ok).json(userUpdate);
  } catch (error) {
    console.error("Error updating user:", error.message);
    res
      .status(HTTPCodes.ServerErrorResponse.InternalError)
      .send("Internal Server Error");
  }next()
});

/*   -----------DELETE--------------- NOT IN USE*/
USER_API.delete("/deleteUser", verifyToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const userDeletion = await DBManager.deleteUser(userId);
    res.status(HTTPCodes.SuccessfulResponse.Ok).json(userDeletion);
  } catch (error) {
    console.error("Error deleting user:", error);
    res
      .status(HTTPCodes.ServerErrorResponse.InternalError)
      .send("Internal Server Error")
      .end();
  }next()
});



/*   -----------GET USER BY ID--------------- */
USER_API.get("/getUserById", verifyToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const userInfo = await DBManager.getUserById(userId);
    res.json({ userInfo });
  } catch (error) {
    console.error("Error getting user by ID:", error.message);
    res
      .status(HTTPCodes.ServerErrorResponse.InternalError)
      .send("Internal Server Error");
  }next()
});

////--------------ALL USERS-----------------NOT IN USE
USER_API.get("/admin/allUsers",verifyToken, isAdmin, async (req, res, next) => {
  try {
    const allUsers = await DBManager.getAllUsers();
    res.status(HTTPCodes.SuccessfulResponse.Ok).json(allUsers);
  } catch (error) {
    console.error("Error fetching all users:", error.message);
    res
      .status(HTTPCodes.ServerErrorResponse.InternalError)
      .send("Internal Server Error");
  }next()
});
//----------------------------------------------------NOT IN USE
USER_API.put("/admin/updateUserRole/:userId", verifyToken, isAdmin, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const userUpdate = await DBManager.updateUserRole(userId, role);
    res.status(HTTPCodes.SuccessfulResponse.Ok).json(userUpdate);
  } catch (error) {
    console.error("Error updating user role:", error.message);
    res
      .status(HTTPCodes.ServerErrorResponse.InternalError)
      .send("Internal Server Error");
  }
  next();
});
/*   -----------SAVE AVATAR--------------- */
USER_API.put("/saveAvatar",  verifyToken,  async (req, res, next) => {
  try {
    const { eyeColor, 
      skinColor,
      hairColor,
      eyebrowType} = req.body;
      const avatar_id= req.user.avatar_id


      let avatar = new Avatar();
      avatar.eyeColor = eyeColor;
     avatar.skinColor = skinColor;
      avatar.hairColor = hairColor;
      avatar.eyebrowType = eyebrowType;
      avatar.id = avatar_id
    
  

      await avatar.save();
    res.status(HTTPCodes.SuccessfulResponse.Ok).json(avatar);
  } catch (error) {
    console.error("Error saving Avatar:", error.message);
    res
      .status(HTTPCodes.ClientSideErrorResponse.Unauthorized)
      .send(error.message);
  }next()
});
/*   -----------GET AVATAR--------------- */
USER_API.get("/getAvatar",  verifyToken,  async (req, res, next) => {
  try {
   
    const avatar_id = req.user.avatar_id
    const avatarInfo = await DBManager.getAvatar(avatar_id);
    res.json({ avatarInfo });
  } catch (error) {
    console.error("Error getting avatar from user:", error.message);
    res
      .status(HTTPCodes.ServerErrorResponse.InternalError)
      .send("Internal Server Error");
  }next()
});

USER_API.post("/generateShareableLink", verifyToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const userInfo = await DBManager.getUserById(userId);
    const avatar_id = userInfo.avatar_id
    const avatarInfo = await DBManager.getAvatar(avatar_id);

   
    const tokenPayload = {
      hairColor: avatarInfo.hairColor,
      eyeColor: avatarInfo.eyeColor,
      skinColor: avatarInfo.skinColor,
      eyebrowType: avatarInfo.eyebrowType,
    };

 
    const token = jwt.sign(tokenPayload, process.env.SECRET_KEY, { expiresIn: '1 day' });

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const shareableLink = `${baseUrl}/sharedAvatar.html?token=${token}`;

    res.json({ shareableLink });
  } catch (error) {
    console.error("Error generating shareable link:", error.message);
    res.status(HTTPCodes.ClientSideErrorResponse.Unauthorized).send(error.message);
  }next()
});
USER_API.post("/decodeSharedAvatar", async (req, res, next) => {
  try {
    const {token} = req.body;

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
   
   res.json(decoded);

  } catch (error) {
    console.error("Error handling shareable link:", error.message);
    res
      .status(HTTPCodes.ServerErrorResponse.InternalError)
      .send("Internal Server Error");
  }next()
});
USER_API.put("/updateLightMode", verifyToken, async (req, res, next) => {
  try {
    const { lightmode } = req.body; 
    const userId = req.user.userId; 

   
    const lightModeUpdateResult = await DBManager.updateLightMode(lightmode, userId);

   
    res.status(HTTPCodes.SuccessfulResponse.Ok).json(lightModeUpdateResult);
  } catch (error) {
    console.error("Error updating light mode choice:", error.message);
    res
      .status(HTTPCodes.ServerErrorResponse.InternalError)
      .send("Internal Server Error");
  }next()
});
USER_API.get("/getLightMode", verifyToken, async (req, res, next) => {
  try {
    const  lightmode  =  req.user.lightmode; 
   
    res.status(HTTPCodes.SuccessfulResponse.Ok).json({lightmode});
  } catch (error) {
    console.error("Error getting light mode choice:", error.message);
    res
      .status(HTTPCodes.ServerErrorResponse.InternalError)
      .send("Internal Server Error");
  }
  next()
});

export default USER_API;
