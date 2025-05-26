import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../utils/auth.utils";
import { db } from "../db";
import { users } from "../db/schema/users.schema";
import { eq } from "drizzle-orm";

export const requireRole =
  (allowedRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Authorization header missing or malformed" });
      return;
    }

    const token = authHeader.split(" ")[1];

    try {
      const payload = verifyJwt(token);

      if (typeof payload !== "object" || !payload.userId) {
        res.status(401).json({ message: "Invalid token payload" });
        return;
      }

      const [user] = await db.select().from(users).where(eq(users.id, payload.userId));

      if (!user) {
        res.status(401).json({ message: "User not found" });
        return;
      }

      if (!allowedRoles.includes(user.role)) {
        res.status(403).json({ message: "Forbidden: insufficient role" });
        return;
      }

      (req as any).user = user;

      next();
    } catch (err) {
      res.status(401).json({ message: "Unauthorized", error: (err as Error).message });
      return;
    }
  };

