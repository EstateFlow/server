import { Router } from "express";
import {
  listingsByRegion,
  priceStatsByRegion,
  topRegions,
  averagePriceGrowth,
} from "../controllers/statistics.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/requireUserWithRole.middleware";

const router = Router();


/**
 * @swagger
 * /stats/listings-by-region:
 *   get:
 *     summary: Get number of listings by region within a specified period
 *     tags:
 *       - Statistics
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Start date of the period (ISO format)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: End date of the period (ISO format)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Listings count by region
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   region:
 *                     type: string
 *                   count:
 *                     type: integer
 *       400:
 *         description: Missing or invalid query parameters
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/listings-by-region",
  requireRole(["moderator"]),
  listingsByRegion
);


/**
 * @swagger
 * /stats/price-stats-by-region:
 *   get:
 *     summary: Get price statistics by region within a specified period
 *     tags:
 *       - Statistics
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Start date of the period (ISO format)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: End date of the period (ISO format)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Price statistics by region
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   region:
 *                     type: string
 *                   averagePrice:
 *                     type: number
 *                   minPrice:
 *                     type: number
 *                   maxPrice:
 *                     type: number
 *       400:
 *         description: Missing or invalid query parameters
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/price-stats-by-region",
  requireRole(["moderator"]),
  priceStatsByRegion
);


/**
 * @swagger
 * /stats/top-regions:
 *   get:
 *     summary: Get top regions by number of listings within a specified period
 *     tags:
 *       - Statistics
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Start date of the period (ISO format)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: End date of the period (ISO format)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Top regions with listing counts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   region:
 *                     type: string
 *                   listingsCount:
 *                     type: integer
 *       400:
 *         description: Missing or invalid query parameters
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/top-regions",
  requireRole(["moderator"]),
  topRegions
);


/**
 * @swagger
 * /stats/average-price-growth:
 *   get:
 *     summary: Get average price growth by region within a specified period
 *     tags:
 *       - Statistics
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Start date of the period (ISO format)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: End date of the period (ISO format)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Average price growth by region
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   region:
 *                     type: string
 *                   averageGrowth:
 *                     type: number
 *       400:
 *         description: Missing or invalid query parameters
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/average-price-growth",
  requireRole(["moderator"]),
  averagePriceGrowth
);

export default router;
