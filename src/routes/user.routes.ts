import { Router } from "express";
import { getUser } from "../controllers/user.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

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
 * /api/user:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                 email:
 *                   type: string
 *                 username:
 *                   type: string
 *                 role:
 *                   type: string
 *                 isEmailVerified:
 *                   type: boolean
 *       401:
 *         description: Unauthorized – token missing or invalid
 *       500:
 *         description: Internal server error
 */
router.get("/", authMiddleware, getUser);

export default router;
