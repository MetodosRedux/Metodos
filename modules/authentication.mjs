import jwt from "jsonwebtoken";
import HTTPCodes from "./httpConstants.mjs";
import DBManager from "./storageManager.mjs";
import { generateHash } from "./crypto.mjs";

export function verifyToken(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(HTTPCodes.ClientSideErrorResponse.Unauthorized).json({msg : "Unauthorized: No data received"});
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    req.tokenResponse = {
      userId: decoded.userId,
      email: decoded.email,
    };
    next();
  } catch (err) {
    return res.status(HTTPCodes.ClientSideErrorResponse.Unauthorized).json({msg : "Unauthorized: please log in again"});
  }
}

export async function loginVerification (req, res, next) {
  try{
  const { email, password } = req.body;
    const secretKey = process.env.SECRET_KEY;
    const pswHash = generateHash(password);

    const user = await DBManager.getUserByEmailAndPassword(email, pswHash);

    if (!user) {
      return res.status(HTTPCodes.ClientSideErrorResponse.Unauthorized).json({msg : "invalid Email or password"});
    }

    const avatar = user.avatar;

    let tokenPayload = {
      userId: user.id,
      email: user.email,
    };

    const token = jwt.sign(tokenPayload, secretKey, { expiresIn: "1h" });
    req.tokenData = {token, avatar}
    next();
  } catch (err) {
    return res.status(HTTPCodes.ClientSideErrorResponse.Unauthorized).json({msg : "Unauthorized: please log in again"});
  }
}
