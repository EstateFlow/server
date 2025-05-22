import { Router } from "express";
import {
  getUserWishlist,
  postWishlistItem,
  deleteWishlistItem,
} from "../controllers/wishlist.controller";
import { RequestHandler } from "express";
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
 * /wishlist:
 *   get:
 *     summary: Get user wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User wishlist items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: string
 *                     example: "user-123"
 *                   propertyId:
 *                     type: string
 *                     example: "property-456"
 *       401:
 *         description: Unauthorized
 */
router.get("/wishlist", getUserWishlist as RequestHandler);

/**
 * @swagger
 * /wishlist:
 *   post:
 *     summary: Add an item to user wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Property ID to add
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - propertyId
 *             properties:
 *               propertyId:
 *                 type: string
 *                 example: "property-456"
 *     responses:
 *       201:
 *         description: Item added to wishlist
 *       400:
 *         description: Missing propertyId in request body
 *       409:
 *         description: Item already in wishlist
 *       401:
 *         description: Unauthorized
 */
router.post("/wishlist", postWishlistItem as RequestHandler);

/**
 * @swagger
 * /wishlist/{propertyId}:
 *   delete:
 *     summary: Remove an item from user wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID to remove from wishlist
 *     responses:
 *       200:
 *         description: Item removed from wishlist
 *       400:
 *         description: Missing propertyId in path parameters
 *       401:
 *         description: Unauthorized
 */
router.delete("/wishlist/:propertyId", deleteWishlistItem as RequestHandler);

export default router;

