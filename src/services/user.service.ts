import { db } from "../db";
import { users } from "../db/schema/users.schema";
import { eq } from "drizzle-orm";

export const getUser = async (userId: string) => {
  const userResult = await db
    .select({
      id: users.id,
      email: users.email,
      username: users.username,
      role: users.role,
      isEmailVerified: users.isEmailVerified,
      listingLimit: users.listingLimit,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (userResult.length === 0) {
    throw new Error("User not found");
  }

  const user = userResult[0];

  return {
    userId: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    listingLimit: user.listingLimit,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};
