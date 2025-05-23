import { Router } from "express";
import {
  addNewProperty,
  deleteProperty,
  getProperty,
  getProperties,
  updateProperty,
  verifyPropertyHandler,
} from "../controllers/properties.controller";
import { requireRole } from "../middleware/requireUserWithRole.middleware";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         username:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         role:
 *           type: string
 *           enum: [renter_buyer, private_seller, agency, moderator, admin]
 *         isEmailVerified:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - id
 *         - username
 *         - email
 *         - role
 *
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
 *       required:
 *         - id
 *         - propertyId
 *         - viewedAt
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
 *         owner:
 *           $ref: '#/components/schemas/User'
 *           nullable: true
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
 *     parameters:
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [active, sold_rented, inactive]
 *         required: false
 *         description: |
 *           Filter properties by their status. Available options:
 *           - `active`: Returns only properties with `status: active`.
 *           - `sold_rented`: Returns properties with `status: sold` or `status: rented`.
 *           - `inactive`: Returns only properties with `status: inactive`.
 *           If not provided, all properties are returned regardless of status.
 *         examples:
 *           active:
 *             summary: Filter active properties
 *             value: active
 *           sold_rented:
 *             summary: Filter sold or rented properties
 *             value: sold_rented
 *           inactive:
 *             summary: Filter inactive properties
 *             value: inactive
 *           all:
 *             summary: Get all properties (no filter)
 *             value: ''
 *     responses:
 *       200:
 *         description: List of properties with relations (images, views, pricing history, and owner)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Property'
 *       400:
 *         description: Invalid filter parameter
 *       500:
 *         description: Internal server error
 */
router.get("/properties", getProperties);

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
router.get("/properties/:propertyId", getProperty);

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

/**
 * @swagger
 * /properties/{id}/verify:
 *   patch:
 *     summary: Mark property as verified
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Property verified
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Property'
 *       403:
 *         description: Forbidden (not admin/moderator)
 *       404:
 *         description: Property not found
 */
function asyncHandler(fn: any) {
  return function (req: any, res: any, next: any) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
router.patch("/properties/:id/verify",
  asyncHandler(requireRole(["admin", "moderator"])),
  asyncHandler(verifyPropertyHandler)
);

export default router;
