import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import { registerValudate } from "../validators/authValudation.js";
import sessionModel from "../models/sessionModel.js";
import { v4 as uuidv4 } from "uuid";
import { createSessionAndSetCookies } from "../utils/createSessionAndSetCookies.js";

export const register = async (req, res) => {
  try {
    const { error } = registerValudate.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        errors: error.details.map((err) => err.message),
      });
    }
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(401).json({
        success: false,
        message: "Missing username,email or password",
      });
    }

    const existUser = await userModel.findOne({ email });

    if (existUser) {
      return res
        .status(401)
        .json({ success: false, message: "user already exist" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = new userModel({
      username,
      email,
      role:"user",
      password: hashPassword,
    });
    await user.save();

    return res
      .status(201)
      .json({ success: true, message: "sucessfully Register" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adminRegister = async (req, res) => {
  try {
    const { error } = registerValudate.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        errors: error.details.map((err) => err.message),
      });
    }
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(401).json({
        success: false,
        message: "Missing username,email or password",
      });
    }

    const existUser = await userModel.findOne({ email });

    if (existUser) {
      return res
        .status(401)
        .json({ success: false, message: "user already exist" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = new userModel({
      username,
      email,
      role:"admin",
      password: hashPassword,
    });
    await user.save();

    return res
      .status(201)
      .json({ success: true, message: "sucessfully Register" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Missing email or password" });
    }

    // Find user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User does not exist" });
    }
    const userRole = user.role;

    if(userRole !== "admin"){
       return res.status(401).json({success:false,message:"only login admin"})
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid password" });
    }

    // Create session + tokens + cookies
    await createSessionAndSetCookies(req, res, user, { singleDevice: true });

    const safeUser = { id: user._id, username: user.username, email: user.email, role: user.role }

    return res.json({ success: true, user: safeUser, message: "Admin login successful" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Missing email or password" });
    }

    // Find user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User does not exist" });
    }
    const userRole = user.role;

    if(userRole !== "user"){
       return res.status(401).json({success:false,message:"only login user"})
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid password" });
    }

      // Create session + tokens + cookies
    await createSessionAndSetCookies(req, res, user, { singleDevice: true });

    const safeUser = { id: user._id, username: user.username, email: user.email, role: user.role }

    return res.json({ success: true, user: safeUser, message: "User login successful" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      // Find the session by refreshToken
      const session = await sessionModel.findOne({ refreshToken, valid: true });

      if (session) {
        // Invalidate the session
        session.valid = false;
        session.refreshToken = '';
        await session.save();
      }

    }

    // Clear cookies
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res
      .status(200)
      .json({ success: true, message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res
        .status(401)
        .json({ success: false, message: "No refresh token provided" });
    }

    // Check token in DB
    const session = await sessionModel.findOne({ refreshToken, valid: true });
    if (!session) {
      return res
        .status(403)
        .json({ success: false, message: "Invalid or expired session" });
    }

    // Verify refresh token
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN, (err, decoded) => {
      if (err) {
        return res
          .status(401)
          .json({ success: false, message: "Expired refresh token" });
      }

      // Generate new access token
      const newAccessToken = jwt.sign(
        { id: decoded.id, email: decoded.email,role:decoded.role,jti: session.tokenId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRE || "5m" }
      );

      // Update access token cookie
      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 5 * 60 * 1000, // 5 minutes
      });

      return res.json({ success: true, accessToken: newAccessToken });
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};