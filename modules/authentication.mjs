// Middleware
import jwt from "jsonwebtoken";
import HTTPCodes from "./httpConstants.mjs";
import DBManager from "./storageManager.mjs";

export function verifyToken(req, res, next) {
  const token = req.headers.authorization;
  console.log(token);

  if (!token) {
    return res
      .status(HTTPCodes.ClientSideErrorResponse.Unauthorized)
      .send("Unauthorized: No token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      avatar_id: decoded.avatar_id,
      lightmode: decoded.lightmode,
    };
    next();
  } catch (err) {
    return res
      .status(HTTPCodes.ClientSideErrorResponse.Unauthorized)
      .send("Unauthorized: Invalid token");
  }
}

export async function isAdmin(req, res, next) {
  const userId = req.user.userId;

  try {
    const user = await DBManager.getUserById(userId);

    if (user && user.role === "admin") {
      return next();
    } else {
      return res
        .status(HTTPCodes.ClientSideErrorResponse.Unauthorized)
        .json({ message: "Forbidden" });
    }
  } catch (error) {
    console.error("Error checking admin role:", error);
    return res
      .status(HTTPCodes.ServerErrorResponse.InternalError)
      .json({ message: "Internal Server Error" });
  }
}
