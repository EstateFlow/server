import { Router } from "express";
import {
  addNewProperty,
  getAllProperties,
  getCertainProperty,
} from "../controllers/properties.controller";

const router = Router();

router.get("/properties", getAllProperties);
router.get("/properties/:propertyId", getCertainProperty);
router.post("/properties", addNewProperty);
// router.put("/properties/:propertyId");
// router.delete("/properties/:propertyId");

export default router;
