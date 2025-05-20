import { Router } from "express";
import {
  createConversationWithPropertyAnalysis,
  getSystemPrompts,
  updateSystemPrompt,
} from "../controllers/ai.controller";

const router = Router();

router.get("/system-prompts", getSystemPrompts);
router.put("/system-prompts", updateSystemPrompt);
router.post(
  "/conversations/property-analysis",
  createConversationWithPropertyAnalysis,
);

export default router;
