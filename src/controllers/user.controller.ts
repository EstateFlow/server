import type { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import * as userService from "../services/user.service";

type ExpressHandler = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => Promise<void>;

export const getUser: ExpressHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized: User ID not found" });
      return;
    }

    const user = await userService.getUser(userId);
    res.status(200).json(user);
  } catch (error: any) {
    console.error("Error in getUser:", error);
    if (error.message === "User not found") {
      res.status(404).json({ message: "User not found" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

export const updateUser: ExpressHandler = async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
  }

  const { username, avatarUrl, bio } = req.body;

  try {
    const updatedUser = await userService.updateUser(userId as string, {
      username,
      avatarUrl,
      bio,
    });

    res.status(200).json(updatedUser);
  } catch (error: any) {
    console.error("Error in updateUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};