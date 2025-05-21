import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { users } from "../db/schema/users.schema";
import { eq } from "drizzle-orm";

interface DecodedToken {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export interface AuthRequest extends Request {
  user?: { userId: string; email: string };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res
        .status(401)
        .json({ message: "Authorization header missing or invalid" });
      return;
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "Token missing" });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;

    db.select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1)
      .then((userResult) => {
        if (userResult.length === 0) {
          res.status(401).json({ message: "User not found" });
          return;
        }

        req.user = { userId: decoded.userId, email: decoded.email };
        next();
      })
      .catch((error) => {
        console.error("Error checking user in authMiddleware:", error);
        res.status(500).json({ message: "Internal server error" });
      });
  } catch (error: any) {
    console.error("Error in authMiddleware:", error);
    if (error.name === "TokenExpiredError") {
      res.status(401).json({ message: "Token expired" });
    } else if (error.name === "JsonWebTokenError") {
      res.status(401).json({ message: "Invalid token" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};
