import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
} from "../services/wishlist.service";

export const getUserWishlist = async (req: AuthRequest, res: Response) => {
  const data = await getWishlist(req.user!.userId);
  res.json(data);
};

export const postWishlistItem = async (req: AuthRequest, res: Response) => {
  const { propertyId } = req.body;
  if (!propertyId) return res.status(400).json({ message: "Missing propertyId" });

  const exists = await isInWishlist(req.user!.userId, propertyId);
  if (exists) return res.status(409).json({ message: "Already in wishlist" });

  await addToWishlist(req.user!.userId, propertyId);
  res.status(201).json({ message: "Added to wishlist" });
};

export const deleteWishlistItem = async (req: AuthRequest, res: Response) => {
  const { propertyId } = req.params;
  if (!propertyId) return res.status(400).json({ message: "Missing propertyId" });

  await removeFromWishlist(req.user!.userId, propertyId);
  res.status(200).json({ message: "Removed from wishlist" });
};
