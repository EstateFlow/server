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
      avatarUrl: users.avatarUrl,
      bio: users.bio,
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
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    isEmailVerified: user.isEmailVerified,
    listingLimit: user.listingLimit,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const updateUser = async (
  userId: string,
  data: { username?: string; avatarUrl?: string; bio?: string },
) => {
  const updateData: any = {};
  if (data.username !== undefined) updateData.username = data.username;
  if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;
  if (data.bio !== undefined) updateData.bio = data.bio;

  if (Object.keys(updateData).length === 0) {
    throw new Error("No valid fields to update");
  }

  await db.update(users)
    .set(updateData)
    .where(eq(users.id, userId));

  const userResult = await db
    .select({
      id: users.id,
      email: users.email,
      username: users.username,
      avatarUrl: users.avatarUrl,
      bio: users.bio,
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
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    listingLimit: user.listingLimit,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};