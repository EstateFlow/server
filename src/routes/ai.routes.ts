import { Router } from "express";
import {
  createConversation,
  getSystemPrompt,
  updateSystemPrompt,
  getConversationHistory,
  sendMessage,
  getVisibleConversationHistory,
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
 *         description: Default system prompt retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "System prompt retrieved successfully"
 *                 prompts:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       description: Unique identifier of the system prompt
 *                     name:
 *                       type: string
 *                       description: Name of the system prompt
 *                     content:
 *                       type: string
 *                       description: Content of the system prompt
 *                     isDefault:
 *                       type: boolean
 *                       description: Indicates if this is the default prompt
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: Creation timestamp
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: Last update timestamp
 *             example:
 *               message: "System prompt retrieved successfully"
 *               prompts:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 name: "Default AI Prompt"
 *                 content: "You are a helpful AI assistant for property analysis."
 *                 isDefault: true
 *                 createdAt: "2025-05-26T18:20:00Z"
 *                 updatedAt: "2025-05-26T18:20:00Z"
 *       404:
 *         description: Default system prompt not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Default system prompt not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "System prompt updated successfully"
 *                 prompt:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       description: Unique identifier of the system prompt
 *                     name:
 *                       type: string
 *                       description: Name of the system prompt
 *                     content:
 *                       type: string
 *                       description: Updated content of the system prompt
 *                     isDefault:
 *                       type: boolean
 *                       description: Indicates if this is the default prompt
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: Creation timestamp
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: Last update timestamp
 *             example:
 *               message: "System prompt updated successfully"
 *               prompt:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 name: "Default AI Prompt"
 *                 content: "You are an expert AI for property market analysis."
 *                 isDefault: true
 *                 createdAt: "2025-05-26T18:20:00Z"
 *                 updatedAt: "2025-05-26T19:30:00Z"
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Missing required fields: name or newContent"
 *       403:
 *         description: Only admins can update system prompts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Only admins can update system prompts"
 *       404:
 *         description: System prompt or user not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "System prompt not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
router.put("/system-prompt", updateSystemPrompt);

/**
 * @swagger
 * /api/ai/conversations:
 *   post:
 *     summary: Create a new AI conversation
 *     description: Creates a new AI conversation for the authenticated user, initializing it with a default system prompt and a list of active properties.
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
 *                 description: Optional title for the conversation
 *                 example: "Property Analysis Chat"
 *                 default: "Property Analysis Chat"
 *     responses:
 *       201:
 *         description: Conversation created with property analysis
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Conversation created with property analysis"
 *                 conversation:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       description: Unique identifier of the conversation
 *                     userId:
 *                       type: string
 *                       format: uuid
 *                       description: ID of the user who owns the conversation
 *                     systemPromptId:
 *                       type: string
 *                       format: uuid
 *                       description: ID of the system prompt used
 *                     title:
 *                       type: string
 *                       description: Title of the conversation
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: Creation timestamp
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: Last update timestamp
 *                     isActive:
 *                       type: boolean
 *                       description: Indicates if the conversation is active
 *                 initialMessage:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       description: Unique identifier of the initial message
 *                     conversationId:
 *                       type: string
 *                       format: uuid
 *                       description: ID of the conversation
 *                     sender:
 *                       type: string
 *                       enum: [user, ai, system]
 *                       description: Sender of the message
 *                     content:
 *                       type: string
 *                       description: Content of the initial message
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: Creation timestamp
 *                     isVisible:
 *                       type: boolean
 *                       description: Indicates if the message is visible
 *             example:
 *               message: "Conversation created with property analysis"
 *               conversation:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 userId: "987e6543-e21b-12d3-a456-426614174000"
 *                 systemPromptId: "456e7890-e89b-12d3-a456-426614174000"
 *                 title: "Property Analysis Chat"
 *                 createdAt: "2025-05-26T18:20:00Z"
 *                 updatedAt: "2025-05-26T18:20:00Z"
 *                 isActive: true
 *               initialMessage:
 *                 id: "789e1234-e89b-12d3-a456-426614174000"
 *                 conversationId: "123e4567-e89b-12d3-a456-426614174000"
 *                 sender: "system"
 *                 content: "You are a helpful AI assistant for property analysis.\n\n### Available Properties:\n- ID: 123..."
 *                 createdAt: "2025-05-26T18:20:00Z"
 *                 isVisible: false
 *       404:
 *         description: User or system prompt not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       409:
 *         description: User already has an active conversation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User already has an active conversation"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
router.post("/conversations", createConversation);

/**
 * @swagger
 * /api/ai/conversations/history:
 *   get:
 *     summary: Get conversation history for current user
 *     description: Fetches the message history of the active conversation for the authenticated user, ordered by creation time.
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conversation history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         description: Unique identifier of the message
 *                       sender:
 *                         type: string
 *                         enum: [user, ai, system]
 *                         description: Sender of the message
 *                       content:
 *                         type: string
 *                         description: Content of the message
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: Creation timestamp
 *                       isVisible:
 *                         type: boolean
 *                         description: Indicates if the message should be displayed to the user
 *                       index:
 *                         type: integer
 *                         description: Sequential order of the message in the conversation
 *             example:
 *               messages:
 *                 - id: "123e4567-e89b-12d3-a456-426614174000"
 *                   sender: "system"
 *                   content: "You are a helpful AI assistant for property analysis.\n\n### Available Properties:\n- ID: 123..."
 *                   createdAt: "2025-05-26T18:20:00Z"
 *                   isVisible: false
 *                   index: 0
 *                 - id: "456e7890-e89b-12d3-a456-426614174000"
 *                   sender: "user"
 *                   content: "Can you analyze property with ID 123?"
 *                   createdAt: "2025-05-26T18:21:00Z"
 *                   isVisible: true
 *                   index: 1
 *                 - id: "789e1234-e89b-12d3-a456-426614174000"
 *                   sender: "ai"
 *                   content: "The property with ID 123 is a 3-bedroom apartment..."
 *                   createdAt: "2025-05-26T18:21:30Z"
 *                   isVisible: true
 *                   index: 2
 *       404:
 *         description: User or active conversation not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No active conversation found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
router.get("/conversations/history", getConversationHistory);

/**
 * @swagger
 * /api/ai/conversations/visible-history:
 *   get:
 *     summary: Retrieve visible conversation history for the current user
 *     description: Fetches the message history of the active conversation for the authenticated user, including only messages with isVisible set to true, ordered by creation time.
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Visible conversation history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         description: Unique identifier of the message
 *                       sender:
 *                         type: string
 *                         enum: [user, ai, system]
 *                         description: Sender of the message
 *                       content:
 *                         type: string
 *                         description: Content of the message
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: Creation timestamp
 *                       index:
 *                         type: integer
 *                         description: Sequential order of the message in the conversation
 *             example:
 *               messages:
 *                 - id: "456e7890-e89b-12d3-a456-426614174000"
 *                   sender: "user"
 *                   content: "Can you analyze property with ID 123?"
 *                   createdAt: "2025-05-26T18:21:00Z"
 *                   index: 0
 *                 - id: "789e1234-e89b-12d3-a456-426614174000"
 *                   sender: "ai"
 *                   content: "The property with ID 123 is a 3-bedroom apartment..."
 *                   createdAt: "2025-05-26T18:21:30Z"
 *                   index: 1
 *       404:
 *         description: User or active conversation not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No active conversation found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
router.get("/conversations/visible-history", getVisibleConversationHistory);

/**
 * @swagger
 * /api/ai/conversations/messages:
 *   post:
 *     summary: Send a message to the AI in a conversation
 *     description: Sends a user message to the AI in the specified conversation and returns the user's message and the AI's response.
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
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: The message content to send to the AI
 *                 example: "Give me best house ever"
 *     responses:
 *       200:
 *         description: Message sent and AI response returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Message sent successfully"
 *                 userMessage:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       description: Unique identifier of the user message
 *                     conversationId:
 *                       type: string
 *                       format: uuid
 *                       description: ID of the conversation
 *                     sender:
 *                       type: string
 *                       enum: [user, ai, system]
 *                       description: Sender of the message
 *                     content:
 *                       type: string
 *                       description: Content of the user message
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: Creation timestamp
 *                     isVisible:
 *                       type: boolean
 *                       description: Indicates if the message is visible
 *                     index:
 *                       type: integer
 *                       description: Sequential order of the message in the conversation

 *                 aiResponse:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       description: Unique identifier of the AI response
 *                     conversationId:
 *                       type: string
 *                       format: uuid
 *                       description: ID of the conversation
 *                     sender:
 *                       type: string
 *                       enum: [user, ai, system]
 *                       description: Sender of the message
 *                     content:
 *                       type: string
 *                       description: Content of the AI response
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: Creation timestamp
 *                     isVisible:
 *                       type: boolean
 *                       description: Indicates if the message is visible
 *                     index:
 *                       type: integer
 *                       description: Sequential order of the message in the conversation
 *             example:
 *               message: "Message sent successfully"
 *               userMessage:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 conversationId: "456e7890-e89b-12d3-a456-426614174000"
 *                 sender: "user"
 *                 content: "Give me best house ever"
 *                 createdAt: "2025-05-26T18:21:00Z"
 *                 isVisible: true
 *                 index: 3
 *               aiResponse:
 *                 id: "789e1234-e89b-12d3-a456-426614174000"
 *                 conversationId: "456e7890-e89b-12d3-a456-426614174000"
 *                 sender: "ai"
 *                 content: "This 3-bedroom apartment..."
 *                 createdAt: "2025-05-26T18:21:30Z"
 *                 isVisible: true
 *               index: 4
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Missing required fields: message or conversationId"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       404:
 *         description: Active conversation not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No active conversation found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
router.post("/conversations/messages", sendMessage);

export default router;
