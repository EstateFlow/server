import { pgEnum } from "drizzle-orm/pg-core";
import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { requestEmailChange, requestPasswordChange, confirmChange } from "../services/change_requests.service";
import { hashPassword } from "../utils/auth.utils";
import { getUser } from "../services/user.service";

type ExpressHandler = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => Promise<void | Response>;


export const requestChangeEmail: ExpressHandler = async (req, res) => {
  const { newEmail } = req.body;
  const userId = req.user?.userId;
  if (!newEmail || !userId) return res.sendStatus(400);

  await requestEmailChange(userId, newEmail);
  res.json({ message: "Confirmation email sent to new address" });
};

export const requestChangePassword: ExpressHandler = async (req, res) => {
  const { newPassword } = req.body;
  const userId = req.user?.userId;
  if (!newPassword || !userId) return res.sendStatus(400);

  const hashed = await hashPassword(newPassword);
  const user = await getUser(userId);
  await requestPasswordChange(userId, hashed, user.email);
  res.json({ message: "Confirmation link sent to your email" });
};

export const confirm_Change: ExpressHandler = async (req, res) => {
  const { token } = req.params;
  try {
    await confirmChange(token);
    res.json({ message: "Change confirmed" });
  } catch {
    res.status(400).json({ message: "Invalid or expired token" });
  }
};
