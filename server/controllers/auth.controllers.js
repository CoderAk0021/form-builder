import jwt from "jsonwebtoken";
import { getCookieOptions, matchPassword } from "../utils/auth.utilities.js";
import Admin from "../models/Admin.js";
import { hashPassword } from "../utils/auth.utilities.js";
import dotenv from 'dotenv';
dotenv.config();

console.log(process.env.NODE_ENV === 'production')
const isProduction = process.env.NODE_ENV === "production";


export async function handleLogin(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.json({ message: "Username and password fields are required" });

    const admin = await Admin.findOne({ username: username });
    if(!admin) return res.status(401).json({success: false,message: 'Invalid Credentials'})
    const hashedPassword = admin.password;
    const isMatched = matchPassword(password, hashedPassword);
    if (!isMatched)
      return res.status(401).json({
        success: false,
        message: "Invalid Credentials",
      });
    const token = jwt.sign(
      { sub: username, role: "admin" },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" },
    );
    res.cookie("token", token, getCookieOptions());
    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.log("Error at Auth.js : ", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export function handleVerify(req, res) {
  res.json({
    success: true,
    user: req.user,
  });
}

export function handleLogout(_req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });

  return res.status(200).json({ success: true });
}

export async function handleRegister(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.json({ message: "Username and Password fields are required" });
    }

    const hashedPassword = await hashPassword(password);
    const newAdmin = new Admin({
      username,
      password: hashedPassword,
    });
    await newAdmin.save();
    return res.status(201).json({ message: "Admin Created !" });
  } catch (error) {
    console.log("Error while Registeering : ", error.message);
    return res.status(500).json({ message: "Internal Server" });
  }
}
