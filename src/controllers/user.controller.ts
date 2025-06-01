import type { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import * as userService from "../services/user.service";
import { Role } from "../types/auth.types";

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

export const getUserById: ExpressHandler = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      res.status(400).json({ message: "Bad Request: User ID is required" });
      return;
    }

    const user = await userService.getUserById(userId);
    res.status(200).json(user);
  } catch (error: any) {
    console.error("Error in getUserById:", error);
    if (error.message === "User not found") {
      res.status(404).json({ message: "User not found" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

export const getAllUsers: ExpressHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized: User ID not provided" });
      return;
    }
    const users = await userService.getAllUsers(userId);
    res.status(200).json(users);
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

  const { username, avatarUrl, bio, paypalCredentials } = req.body;

  try {
    const updatedUser = await userService.updateUser(userId as string, {
      username,
      avatarUrl,
      bio,
      paypalCredentials,
    });

    res.status(200).json(updatedUser);
  } catch (error: any) {
    console.error("Error in updateUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUserById: ExpressHandler = async (req, res) => {
  try {
    const userId = req.params.userId;
    const updatedInfo = req.body.updatedInfo;

    const updatedUser = await userService.updateUserById(userId, updatedInfo);

    res.status(200).json(updatedUser);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update user";
    res.status(400).json({ message: errorMessage });
  }
};

export const addNewUser: ExpressHandler = async (req, res) => {
  try {
    const newUserInfo = req.body.newUserInfo as {
      avatarUrl: string;
      username: string;
      email: string;
      password: string;
      role: Role;
      bio: string;
    };

    if (
      !newUserInfo.email ||
      !newUserInfo.username ||
      !newUserInfo.password ||
      !newUserInfo.role
    ) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const newUser = await userService.addNewUser(newUserInfo);
    res.status(201).json(newUser);
  } catch (error) {
    console.error("Error adding new user:", error);
    if (
      error instanceof Error &&
      error.message === "User with this email already exists"
    ) {
      res.status(409).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteUser: ExpressHandler = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      res.status(400).json({ error: "User ID is required" });
      return;
    }

    await userService.deleteUser(userId);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    if (error instanceof Error && error.message === "User not found") {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Internal server error" });
  }
};
