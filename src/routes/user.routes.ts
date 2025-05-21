import { Router } from "express";
import { getUser } from "../controllers/user.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/user", authMiddleware, getUser);

export default router;
