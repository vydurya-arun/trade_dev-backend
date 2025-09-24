import jwt from "jsonwebtoken";
import sessionModel from "../models/sessionModel.js";

export const authMiddleware = async (req, res, next) => {
  try {
    // Read access token from cookie
    const token = req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    //Verify access token
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ success: false, message: "Invalid or expired token" });
      }

      // Find corresponding session (by tokenId from JWT jti claim)
      const session = await sessionModel.findOne({ tokenId: decoded.jti, valid: true });
      if (!session) {
        return res.status(403).json({ success: false, message: "Session is invalid or logged out" });
      }

      // Attach user info and session to request
      req.user = decoded;
      req.session = session;

      next();
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
