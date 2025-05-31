import { Router } from "express";
import {
  listingsByRegion,
  priceStatsByRegion,
  topRegions,
  averagePriceGrowth,
  totalSales,
  topViewedProperties,
  newUsersStats 
} from "../controllers/statistics.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/requireUserWithRole.middleware";
import { getPropertyViewsByDate } from '../controllers/statistics.controller';

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


/**
 * @swagger
 * /stats/property-views/{propertyId}:
 *   get:
 *     summary: Get property view stats by date range
 *     tags:
 *       - Statistics
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the property
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Property view count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 propertyId:
 *                   type: string
 *                 views:
 *                   type: integer
 */
router.get('/property-views/:propertyId', getPropertyViewsByDate);


/**
 * @swagger
 * /stats/total-sales:
 *   get:
 *     summary: Get total sales and rented properties statistics
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
 *         description: Total sales and rented properties statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalSales:
 *                   type: integer
 *                   description: Total number of sold/rented properties
 *                 totalAmount:
 *                   type: string
 *                   description: Total amount in specified currency
 *       400:
 *         description: Missing or invalid query parameters
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/total-sales",
  authMiddleware,
  requireRole(["moderator", "admin"]),
  totalSales
);

/**
 * @swagger
 * /stats/top-viewed:
 *   get:
 *     summary: Get top viewed properties
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
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of top properties to return
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of top viewed properties
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   price:
 *                     type: string
 *                   address:
 *                     type: string
 *                   view_count:
 *                     type: integer
 *       400:
 *         description: Missing or invalid query parameters
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/top-viewed",
  authMiddleware,
  requireRole(["moderator", "admin"]),
  topViewedProperties
);

/**
 * @swagger
 * /stats/new-users:
 *   get:
 *     summary: Get statistics of new users by type
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
 *         description: New users statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 new_buyers:
 *                   type: integer
 *                   description: Number of new renters/buyers
 *                 new_sellers:
 *                   type: integer
 *                   description: Number of new private sellers
 *                 new_agencies:
 *                   type: integer
 *                   description: Number of new agencies
 *       400:
 *         description: Missing or invalid query parameters
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/new-users",
  authMiddleware,
  requireRole(["moderator", "admin"]),
  newUsersStats
);

export default router;
