import { Router } from "express";
import {
  addNewProperty,
  deleteProperty,
  getAllProperties,
  getCertainProperty,
  updateProperty,
} from "../controllers/properties.controller";

const router = Router();

router.get("/properties", getAllProperties);
router.get("/properties/:propertyId", getCertainProperty);
router.post("/properties", addNewProperty);
router.patch("/properties/:propertyId", updateProperty);
router.delete("/properties/:propertyId", deleteProperty);

export default router;
