import { pgEnum } from "drizzle-orm/pg-core";
import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { requestEmailChange, requestPasswordChange, confirmChange } from "../services/change_requests.service";
import { hashPassword } from "../utils/auth.utils";
import { getUser } from "../services/user.service";
import { changeRequests } from "../db/schema/change_requests.schema";
import { users } from "../db/schema/users.schema";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { hash } from "bcrypt";
import crypto from "crypto";
import { sendChangeConfirmationEmail, sendResetConfirmationEmail } from "../services/email.service";

type ExpressHandler = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => Promise<void | Response>;


export const requestChangeEmail: ExpressHandler = async (req, res) => {
  const { newEmail } = req.body;
  const userId = req.user?.userId;
  
  if (!newEmail || !userId) {
    return res.status(400).json({ message: "Email and user ID are required" });
  }

  try {
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, newEmail));

    if (existingUser && existingUser.id !== userId) {
      return res.status(400).json({ message: "Email is already in use by another user" });
    }

    await requestEmailChange(userId, newEmail);
    res.json({ message: "Confirmation email sent to new address" });
  } catch (error) {
    console.error("Error requesting email change:", error);
    res.status(500).json({ message: "Failed to process email change request" });
  }
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
    const result = await confirmChange(token);
    res.json(result);
  } catch {
    res.status(400).json({ message: "Invalid or expired token" });
  }
};

export const requestPasswordResetHandler = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) {
      return res.status(400).json({ message: "Account with this email either does not exist, or an incorrect email was entered" });
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 час

    await db.insert(changeRequests).values({
      userId: user.id,
      type: "password",
      newValue: "placeholder",
      token,
      expiresAt,
    });

    await sendResetConfirmationEmail(email, token, "password");

    res.status(200).json({ message: "Reset link sent if email exists" });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ message: "Internal server error", error: error instanceof Error ? error.message : "Unknown error" });
  }
};

export const resetPasswordHandler = async (req: Request, res: Response) => {
    try {
    const { token, password } = req.body;

    const [request] = await db
        .select()
        .from(changeRequests)
        .where(eq(changeRequests.token, token));

    if (!request || request.expiresAt < new Date() || request.type !== "password") {
        return res.status(400).json({ message: "Invalid or expired token" });
    }

    const passwordHash = await hash(password, 10);

    await db
        .update(users)
        .set({ passwordHash })
        .where(eq(users.id, request.userId));

    await db.delete(changeRequests).where(eq(changeRequests.id, request.id));

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ message: "Internal server error", error: error instanceof Error ? error.message : "Unknown error" });
  }
};