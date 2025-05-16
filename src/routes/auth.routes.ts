import { Router } from "express";
import {
  facebookAuth,
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
router.post("/facebook", facebookAuth);
router.get("/verify-email/:token", verifyEmail);

export default router;
