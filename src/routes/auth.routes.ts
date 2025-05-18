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


/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       description: User registration data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - role
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 */
router.post("/register", register);


/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user and return tokens
 *     tags: [Auth]
 *     requestBody:
 *       description: User login credentials
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful, returns access and refresh tokens
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Email not verified
 *       500:
 *         description: Internal server error
 */
router.post("/login", login);


/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Refresh access and refresh tokens
 *     tags: [Auth]
 *     requestBody:
 *       description: Refresh token
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tokens refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       401:
 *         description: Invalid or expired refresh token
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post("/refresh-token", refreshToken);


/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Authenticate or register user via Google OAuth
 *     tags: [Auth]
 *     requestBody:
 *       description: Authorization code from Google OAuth
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Google authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 isNewUser:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Authorization code is required
 *       500:
 *         description: Internal server error
 */
router.post("/google", googleAuth);


/**
 * @swagger
 * /api/auth/facebook:
 *   post:
 *     summary: Authenticate or register user via Facebook OAuth
 *     tags: [Auth]
 *     requestBody:
 *       description: Authorization code from Facebook OAuth
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Facebook authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 isNewUser:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Authorization code is required
 *       500:
 *         description: Facebook authentication failed
 */
router.post("/facebook", facebookAuth);


/**
 * @swagger
 * /api/auth/verify-email/{token}:
 *   get:
 *     summary: Verify user email by token
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Email verification token
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid or expired token
 *       500:
 *         description: Internal server error
 */
router.get("/verify-email/:token", verifyEmail);

export default router;
