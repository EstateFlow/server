import { Router } from "express";
import { createOrder, captureOrder } from "../services/paypal.service";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: PayPal
 *   description: PayPal payment processing operations
 * 
 * /api/paypal/create-order:
 *   post:
 *     summary: Create a new PayPal order
 *     tags: [PayPal]
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
 *                 description: The total amount for the order
 *                 example: "99.99"
 *               currency:
 *                 type: string
 *                 description: Currency code (defaults to USD if not provided)
 *                 example: "USD"
 *                 default: "USD"
 *               item:
 *                 type: object
 *                 required:
 *                   - name
 *                   - sku
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: Item name
 *                     example: "Premium Property Listing"
 *                   description:
 *                     type: string
 *                     description: Optional item description
 *                     example: "30-day featured listing for property"
 *                   sku:
 *                     type: string
 *                     description: Stock keeping unit (usually property ID)
 *                     example: "prop_12345"
 *                   category:
 *                     type: string
 *                     enum: [DIGITAL_GOODS, PHYSICAL_GOODS, DONATION]
 *                     description: Item category
 *                     default: PHYSICAL_GOODS
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
 *                   description: PayPal order ID
 *                   example: "5O190127TN364715T"
 *                 status:
 *                   type: string
 *                   description: Order status
 *                   example: "CREATED"
 *                 links:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       href:
 *                         type: string
 *                       rel:
 *                         type: string
 *                       method:
 *                         type: string
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to create PayPal order"
 */
router.post("/create-order", async (req, res) => {
  try {
    const { amount, item } = req.body;
    const order = await createOrder(amount, item);
    res.json({ id: order.id });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/paypal/capture-order:
 *   post:
 *     summary: Capture a PayPal payment
 *     description: Captures the payment for an approved PayPal order and updates property status
 *     tags: [PayPal]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: PayPal order ID to capture
 *                 example: "5O190127TN364715T"
 *               email:
 *                 type: string
 *                 description: Customer email for receipt (optional, will use payer email if not provided)
 *                 example: "customer@example.com"
 *     responses:
 *       200:
 *         description: Payment captured successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: PayPal order ID
 *                   example: "5O190127TN364715T"
 *                 status:
 *                   type: string
 *                   description: Order status
 *                   example: "COMPLETED"
 *                 createTime:
 *                   type: string
 *                   format: date-time
 *                   description: Order creation timestamp
 *                 updateTime:
 *                   type: string
 *                   format: date-time
 *                   description: Order update timestamp
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       sku:
 *                         type: string
 *       400:
 *         description: Invalid order ID or missing required fields
 *       404:
 *         description: Order not found
 *       500:
 *         description: Failed to capture payment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to capture PayPal order"
 */
router.post("/capture-order", async (req, res) => {
  try {
    const { orderId, propertyId, email } = req.body;
    const capture = await captureOrder(orderId, propertyId, email);
    res.json({ status: capture.status, id: capture.id });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
});

export default router;
