import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { users } from "../db/schema/users.schema";
import { refreshTokens } from "../db/schema/refresh_tokens.schema";

dotenv.config();

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateJwt = (userId: string, email: string): string => {
  return jwt.sign({ userId, email }, process.env.JWT_SECRET!, {
    expiresIn: "1h",
  });
};

export const verifyJwt = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET!);
};

export const generateRefreshToken = async (userId: string): Promise<string> => {
  try {
    const token = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: "7d",
    });
    const hashedToken = await bcrypt.hash(token, 10);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    if (isNaN(expiresAt.getTime())) {
      throw new Error("Invalid refresh token expiration date");
    }

    await db.insert(refreshTokens).values({
      userId,
      token: hashedToken,
      expiresAt,
    });

    return token;
  } catch (error) {
    console.error("Error generating refresh token:", error);
    throw error;
  }
};
