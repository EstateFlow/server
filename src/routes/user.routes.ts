import { Router, RequestHandler } from "express";
import {
  getUser,
  getUserById,
  updateUser,
} from "../controllers/user.controller";
import {
  requestChangeEmail,
  requestChangePassword,
  confirm_Change,
  requestPasswordResetHandler,
  resetPasswordHandler,
} from "../controllers/change_requests.controller";

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
 *                 avatarUrl:
 *                   type: string
 *                 bio:
 *                   type: string
 *                 isEmailVerified:
 *                   type: boolean
 *                 listingLimit:
 *                   type: integer
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized – token missing or invalid
 *       500:
 *         description: Internal server error
 */
router.get("/", authMiddleware, getUser);

/**
 * @swagger
 * /api/user/{userId}:
 *   get:
 *     summary: Get user by ID with their properties
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to retrieve
 *     responses:
 *       200:
 *         description: Successfully retrieved user with properties
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
 *                 avatarUrl:
 *                   type: string
 *                 bio:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                 subscription:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "active"
 *                     startDate:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-05-30T19:02:00Z"
 *                     endDate:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-06-29T19:02:00Z"
 *                     planName:
 *                       type: string
 *                       example: "Pro Plan"
 *                     planPrice:
 *                       type: number
 *                       example: 9.99
 *                     planCurrency:
 *                       type: string
 *                       example: "USD"
 *                 properties:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       propertyType:
 *                         type: string
 *                         enum: [house, apartment]
 *                       transactionType:
 *                         type: string
 *                         enum: [sale, rent]
 *                       price:
 *                         type: number
 *                       currency:
 *                         type: string
 *                       size:
 *                         type: number
 *                       rooms:
 *                         type: integer
 *                       address:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: [active, inactive, sold, rented]
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Bad Request – user ID is required
 *       401:
 *         description: Unauthorized – token missing or invalid
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get("/:userId", authMiddleware, getUserById);

/**
 * @swagger
 * /api/user:
 *   patch:
 *     summary: Update current authenticated user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               avatarUrl:
 *                 type: string
 *                 format: uri
 *               bio:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully updated user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                 avatarUrl:
 *                   type: string
 *                 bio:
 *                   type: string
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.patch("/", authMiddleware, updateUser);

/**
 * @swagger
 * /api/user/request-email-change:
 *   post:
 *     summary: Request email change
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newEmail:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email change requested
 *       400:
 *         description: Invalid email
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/request-email-change",
  authMiddleware,
  requestChangeEmail as RequestHandler,
);

/**
 * @swagger
 * /api/user/request-password-change:
 *   post:
 *     summary: Request password change
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password change requested
 *       400:
 *         description: Invalid password
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/request-password-change",
  authMiddleware,
  requestChangePassword as RequestHandler,
);

/**
 * @swagger
 * /api/user/confirm-change/{token}/{type}:
 *   get:
 *     summary: Confirm email or password change
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Change confirmed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email changed successfully
 *                 email:
 *                   type: string
 *                   example: new@example.com
 *                   description: Present only for email change requests
 *       400:
 *         description: Invalid or expired token
 *       500:
 *         description: Server error
 */
router.get("/confirm-change/:token/:type", confirm_Change as RequestHandler);

/**
 * @swagger
 * /api/user/password-reset-request:
 *   post:
 *     summary: Request a password reset link
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: If the email exists, a reset link was sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Reset link sent if email exists
 *       400:
 *         description: Account with this email either does not exist, or an incorrect email was entered"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Account with this email either does not exist, or an incorrect email was entered"
 *       500:
 *         description: Internal server error
 */
router.post(
  "/password-reset-request",
  requestPasswordResetHandler as RequestHandler,
);

/**
 * @swagger
 * /api/user/password-reset:
 *   post:
 *     summary: Reset password with token
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               password:
 *                 type: string
 *                 format: password
 *                 example: NewSecurePassword123!
 *     responses:
 *       200:
 *         description: Password successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password updated successfully
 *       400:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid or expired token
 *       500:
 *         description: Internal server error
 */
router.post("/password-reset", resetPasswordHandler as RequestHandler);

export default router;
