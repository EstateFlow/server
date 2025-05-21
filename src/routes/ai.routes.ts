import { Router } from "express";
import {
  createConversation,
  getSystemPrompt,
  updateSystemPrompt,
  getConversationHistory,
  sendMessage,
} from "../controllers/ai.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);
router.get("/system-prompt", getSystemPrompt);
router.put("/system-prompt", updateSystemPrompt);
router.post("/conversations", createConversation);
router.get("/conversations/history", getConversationHistory);
router.post("/conversations/:conversationId/messages", sendMessage);

export default router;
