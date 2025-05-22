import { Router } from "express";
import { createOrder, captureOrder } from "../services/paypal.service";

const router = Router();

/**
 * @swagger
 * /paypal/create-order:
 *   post:
 *     summary: Create a PayPal order
 *     tags:
 *       - PayPal
 *     requestBody:
 *       description: Order amount
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: string
 *                 example: "9.99"
 *     responses:
 *       200:
 *         description: PayPal order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *       500:
 *         description: Failed to create PayPal order
 */
router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;
    const order = await createOrder(amount);
    res.json({ id: order.id });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /paypal/capture-order:
 *   post:
 *     summary: Capture a PayPal order
 *     tags:
 *       - PayPal
 *     requestBody:
 *       description: PayPal order ID
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *                 example: "8LY61829WD9084701"
 *     responses:
 *       200:
 *         description: PayPal order captured successfully
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
 *         description: Failed to capture PayPal order
 */
router.post("/capture-order", async (req, res) => {
  try {
    const { orderId } = req.body;
    const capture = await captureOrder(orderId);
    res.json({ status: capture.status, id: capture.id });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
});

export default router;
