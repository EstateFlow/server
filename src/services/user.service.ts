import { db } from "../db";
import { properties } from "../db/schema/properties.schema";
import { users } from "../db/schema/users.schema";
import { and, eq } from "drizzle-orm";

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

export const getUserById = async (userId: string) => {
  const userResult = await db
    .select({
      id: users.id,
      email: users.email,
      username: users.username,
      role: users.role,
      avatarUrl: users.avatarUrl,
      bio: users.bio,
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

  const propertiesResult = await db
    .select({
      id: properties.id,
      title: properties.title,
      description: properties.description,
      propertyType: properties.propertyType,
      transactionType: properties.transactionType,
      price: properties.price,
      currency: properties.currency,
      size: properties.size,
      rooms: properties.rooms,
      address: properties.address,
      createdAt: properties.createdAt,
      updatedAt: properties.updatedAt,
    })
    .from(properties)
    .where(
      and(eq(properties.ownerId, user.id), eq(properties.isVerified, true)),
    );

  return {
    userId: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    properties: propertiesResult,
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
  if (data.username !== undefined || data.avatarUrl !== undefined || data.bio !== undefined) updateData.updatedAt = new Date().getTime();

  if (Object.keys(updateData).length === 0) {
    throw new Error("No valid fields to update");
  }

  await db.update(users).set(updateData).where(eq(users.id, userId));

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
    username: user.username,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    updatedAt: user.updatedAt,
  };
};

