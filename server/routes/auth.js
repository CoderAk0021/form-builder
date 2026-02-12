
import express from "express";
import { checkCookies } from "../middlewares/auth.middleware.js";
import { handleLogin, handleLogout, handleVerify } from "../controllers/auth.controllers.js";


const router = express.Router();

router.post("/admin/login", handleLogin);
router.get("/verify", checkCookies, handleVerify);
router.post("/logout", handleLogout);
//router.post('/admin/register',handleRegister);

export default router;

