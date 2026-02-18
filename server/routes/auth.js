
import express from "express";
import { checkCookies } from "../middlewares/auth.middleware.js";
import {
  handleLogin,
  handleLogout,
  handleVerify,
  handleRegister,
  handleTestGoogleAuth,
} from "../controllers/auth.controllers.js";


const router = express.Router();

router.post("/admin/login", handleLogin);
router.post("/test/google", handleTestGoogleAuth);
router.get("/verify", checkCookies, handleVerify);
router.post("/logout", handleLogout);
router.post('/admin/register',handleRegister);

export default router;

