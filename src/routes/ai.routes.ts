import { Router } from "express";
import {
  createConversation,
  getSystemPrompt,
  updateSystemPrompt,
  getConversationHistory,
  sendMessage,
} from "../controllers/ai.controller";

const router = Router();

router.get("/system-prompt", getSystemPrompt);
router.put("/system-prompt", updateSystemPrompt);
router.post("/conversations", createConversation);
router.get("/conversations/:userId/history", getConversationHistory);
router.post("/conversations/:conversationId/messages", sendMessage);

export default router;
