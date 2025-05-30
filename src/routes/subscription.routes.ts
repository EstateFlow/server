import Router from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  captureSubscriptionOrder,
  createSubscriptionOrder,
  getSubscriptions,
} from "../controllers/subscription.controller";

const router = Router();

/**
 * @swagger
 * /api/subscription:
 *   get:
 *     summary: Get all subscription plans
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved subscription plans
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 subscriptions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "plan-uuid-1234"
 *                       name:
 *                         type: string
 *                         example: "Pro Plan"
 *                       price:
 *                         type: number
 *                         example: 9.99
 *                       currency:
 *                         type: string
 *                         example: "USD"
 *                       durationDays:
 *                         type: integer
 *                         example: 30
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-05-30T19:02:00Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-05-30T19:02:00Z"
 *       401:
 *         description: Unauthorized - token missing or invalid
 *       500:
 *         description: Failed to fetch subscriptions
 */
router.get("/", authMiddleware, getSubscriptions);

/**
 * @swagger
 * /api/subscription/create-subscription-order:
 *   post:
 *     summary: Create a PayPal subscription order
 *     tags: [Subscription]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - item
 *             properties:
 *               amount:
 *                 type: string
 *                 example: "9.99"
 *               item:
 *                 type: object
 *                 required:
 *                   - name
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: "Pro Plan"
 *                   description:
 *                     type: string
 *                     example: "Access to premium features"
 *                   category:
 *                     type: string
 *                     enum: [DIGITAL_GOODS, PHYSICAL_GOODS, DONATION]
 *                     example: "DIGITAL_GOODS"
 *     responses:
 *       200:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *       500:
 *         description: Internal server error
 */
router.post(
  "/create-subscription-order",
  authMiddleware,
  createSubscriptionOrder,
);

/**
 * @swagger
 * /api/subscription/capture-subscription-order:
 *   post:
 *     summary: Capture a PayPal subscription order and activate subscription
 *     tags: [Subscription]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - userId
 *               - subscriptionPlanId
 *             properties:
 *               orderId:
 *                 type: string
 *                 example: "1AB23456CD7890123"
 *               userId:
 *                 type: string
 *                 example: "user-uuid-1234"
 *               subscriptionPlanId:
 *                 type: string
 *                 example: "plan-uuid-1234"
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: Order captured and subscription created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 id:
 *                   type: string
 *       500:
 *         description: Failed to capture PayPal subscription order
 */
router.post(
  "/capture-subscription-order",
  authMiddleware,
  captureSubscriptionOrder,
);

export default router;
