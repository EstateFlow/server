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

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/ai/system-prompt:
 *   get:
 *     summary: Get default system prompt
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System prompt retrieved successfully
 *       404:
 *         description: Default system prompt not found
 *       500:
 *         description: Internal server error
 */
router.get("/system-prompt", getSystemPrompt);

/**
 * @swagger
 * /api/ai/system-prompt:
 *   put:
 *     summary: Update default system prompt
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - newContent
 *             properties:
 *               name:
 *                 type: string
 *               newContent:
 *                 type: string
 *     responses:
 *       200:
 *         description: System prompt updated successfully
 *       400:
 *         description: Missing required fields
 *       403:
 *         description: Only admins can update system prompts
 *       404:
 *         description: System prompt or user not found
 *       500:
 *         description: Internal server error
 */
router.put("/system-prompt", updateSystemPrompt);

/**
 * @swagger
 * /api/ai/conversations:
 *   post:
 *     summary: Create a new AI conversation
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *     responses:
 *       201:
 *         description: Conversation created with property analysis
 *       404:
 *         description: User or system prompt not found
 *       409:
 *         description: User already has an active conversation
 *       500:
 *         description: Internal server error
 */
router.post("/conversations", createConversation);

/**
 * @swagger
 * /api/ai/conversations/history:
 *   get:
 *     summary: Get conversation history for current user
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conversation history retrieved successfully
 *       404:
 *         description: User or active conversation not found
 *       500:
 *         description: Internal server error
 */
router.get("/conversations/history", getConversationHistory);

/**
 * @swagger
 * /api/ai/conversations/{conversationId}/messages:
 *   post:
 *     summary: Send a message to the AI in a conversation
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the conversation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message sent and AI response returned
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Active conversation not found
 *       500:
 *         description: Internal server error
 */
router.post("/conversations/:conversationId/messages", sendMessage);

export default router;
