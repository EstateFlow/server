import type { Request, Response, NextFunction } from "express";
import * as propertiesService from "../services/properties.service";

type ExpressHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

export const getAllProperties: ExpressHandler = async (req, res) => {
  try {
    const properties = await propertiesService.getAllProperties();
    res.status(200).json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
};

export const getCertainProperty: ExpressHandler = async (req, res) => {
  try {
    const { propertyId } = req.params;

    if (!propertyId) {
      res.status(400).json({ error: "Property ID is required" });
      return;
    }

    const property = await propertiesService.getCertainProperty(propertyId);
    res.status(200).json(property);
  } catch (error: any) {
    console.error(`Error fetching property ${req.params.propertyId}:`, error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    res
      .status(error.message.includes("not found") ? 404 : 500)
      .json({ error: message });
  }
};

export const addNewProperty: ExpressHandler = async (req, res) => {
  try {
    const propertyData = req.body;
    const newProperty = await propertiesService.addNewProperty(propertyData);
    res.status(201).json(newProperty);
  } catch (error) {
    console.error("Error adding property:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
};

export const deleteProperty: ExpressHandler = async (req, res) => {
  try {
    const { propertyId } = req.params;

    if (!propertyId) {
      res.status(400).json({ error: "Property ID is required" });
      return;
    }

    await propertiesService.deleteProperty(propertyId);
    res.status(200).json({ message: "Property deleted successfully" });
  } catch (error: any) {
    console.error(`Error deleting property ${req.params.propertyId}:`, error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    res
      .status(
        error.message.includes("not found")
          ? 404
          : error.message.includes("not authorized")
            ? 403
            : 500,
      )
      .json({ error: message });
  }
};

export const updateProperty: ExpressHandler = async (req, res) => {
  try {
    const { propertyId } = req.params;

    if (!propertyId) {
      res.status(400).json({ error: "Property ID is required" });
      return;
    }

    const updatedPropertyData = req.body;

    const updatedProperty = await propertiesService.updateProperty(
      propertyId,
      updatedPropertyData,
    );

    res.status(200).json({
      message: "Property updated successfully",
      data: updatedProperty,
    });
  } catch (error: any) {
    if (error.message.includes("not found")) {
      res.status(404).json({ error: error.message });
      return;
    }

    console.error("Error updating property:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
