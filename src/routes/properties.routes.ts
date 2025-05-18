import { Router } from "express";
import {
  addNewProperty,
  deleteProperty,
  getAllProperties,
  getCertainProperty,
  updateProperty,
} from "../controllers/properties.controller";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     PropertyImage:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         propertyId:
 *           type: string
 *           format: uuid
 *         imageUrl:
 *           type: string
 *           format: uri
 *         isPrimary:
 *           type: boolean
 *       required:
 *         - id
 *         - propertyId
 *         - imageUrl
 *         - isPrimary
 * 
 *     PropertyView:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         propertyId:
 *           type: string
 *           format: uuid
 *         viewedAt:
 *           type: string
 *           format: date-time
 *         viewerIp:
 *           type: string
 *           format: ipv4
 *       required:
 *         - id
 *         - propertyId
 *         - viewedAt
 *         - viewerIp
 * 
 *     PricingHistory:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         propertyId:
 *           type: string
 *           format: uuid
 *         price:
 *           type: string
 *         currency:
 *           type: string
 *         effectiveDate:
 *           type: string
 *           format: date-time
 *       required:
 *         - id
 *         - propertyId
 *         - price
 *         - currency
 *         - effectiveDate
 * 
 *     Property:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         ownerId:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         propertyType:
 *           type: string
 *           enum: [house, apartment]
 *         transactionType:
 *           type: string
 *           enum: [sale, rent]
 *         price:
 *           type: string
 *         currency:
 *           type: string
 *         size:
 *           type: string
 *         rooms:
 *           type: integer
 *         address:
 *           type: string
 *         status:
 *           type: string
 *           enum: [active, inactive, sold, rented]
 *         documentUrl:
 *           type: string
 *           format: uri
 *         verificationComments:
 *           type: string
 *         isVerified:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         images:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PropertyImage'
 *         views:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PropertyView'
 *         pricingHistory:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PricingHistory'
 *       required:
 *         - id
 *         - ownerId
 *         - title
 *         - propertyType
 *         - transactionType
 *         - price
 *         - address
 * 
 *     CreatePropertyInput:
 *       type: object
 *       properties:
 *         ownerId:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         propertyType:
 *           type: string
 *           enum: [house, apartment]
 *         transactionType:
 *           type: string
 *           enum: [sale, rent]
 *         price:
 *           type: string
 *         currency:
 *           type: string
 *         size:
 *           type: string
 *         rooms:
 *           type: integer
 *         address:
 *           type: string
 *         status:
 *           type: string
 *           enum: [active, inactive, sold, rented]
 *         documentUrl:
 *           type: string
 *           format: uri
 *         verificationComments:
 *           type: string
 *         images:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *               isPrimary:
 *                 type: boolean
 *             required:
 *               - imageUrl
 *               - isPrimary
 *       required:
 *         - ownerId
 *         - title
 *         - propertyType
 *         - transactionType
 *         - price
 *         - address
 * 
 *     UpdatePropertyInput:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         propertyType:
 *           type: string
 *           enum: [house, apartment]
 *         transactionType:
 *           type: string
 *           enum: [sale, rent]
 *         price:
 *           type: string
 *         currency:
 *           type: string
 *         size:
 *           type: string
 *         rooms:
 *           type: integer
 *         address:
 *           type: string
 *         status:
 *           type: string
 *           enum: [active, inactive, sold, rented]
 *         documentUrl:
 *           type: string
 *           format: uri
 *         verificationComments:
 *           type: string
 *         isVerified:
 *           type: boolean
 *         images:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *               isPrimary:
 *                 type: boolean
 *             required:
 *               - imageUrl
 *               - isPrimary
 */

/**
 * @swagger
 * /properties:
 *   get:
 *     summary: Get all properties
 *     tags:
 *       - Properties
 *     responses:
 *       200:
 *         description: List of properties
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Property'
 *       500:
 *         description: Internal server error
 */
router.get("/properties", getAllProperties);

/**
 * @swagger
 * /properties/{propertyId}:
 *   get:
 *     summary: Get a property by ID
 *     tags:
 *       - Properties
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the property
 *     responses:
 *       200:
 *         description: Property details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Property'
 *       400:
 *         description: Property ID is required
 *       404:
 *         description: Property not found
 *       500:
 *         description: Internal server error
 */
router.get("/properties/:propertyId", getCertainProperty);

/**
 * @swagger
 * /properties:
 *   post:
 *     summary: Add a new property
 *     tags:
 *       - Properties
 *     requestBody:
 *       description: Property data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePropertyInput'
 *     responses:
 *       201:
 *         description: Property created successfully
 *       500:
 *         description: Internal server error
 */
router.post("/properties", addNewProperty);

/**
 * @swagger
 * /properties/{propertyId}:
 *   patch:
 *     summary: Update a property by ID
 *     tags:
 *       - Properties
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the property to update
 *     requestBody:
 *       description: Updated property data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePropertyInput'
 *     responses:
 *       200:
 *         description: Property updated successfully
 *       400:
 *         description: Property ID is required
 *       404:
 *         description: Property not found
 *       500:
 *         description: Internal server error
 */
router.patch("/properties/:propertyId", updateProperty);

/**
 * @swagger
 * /properties/{propertyId}:
 *   delete:
 *     summary: Delete a property by ID
 *     tags:
 *       - Properties
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the property to delete
 *     responses:
 *       200:
 *         description: Property deleted successfully
 *       400:
 *         description: Property ID is required
 *       403:
 *         description: Not authorized to delete this property
 *       404:
 *         description: Property not found
 *       500:
 *         description: Internal server error
 */
router.delete("/properties/:propertyId", deleteProperty);

export default router;