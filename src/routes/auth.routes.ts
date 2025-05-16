import { Router } from "express";
import {
  googleAuth,
  login,
  refreshToken,
  register,
  verifyEmail,
} from "../controllers/auth.controller";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post("/google", googleAuth);
router.get("/verify-email/:token", verifyEmail);

export default router;
