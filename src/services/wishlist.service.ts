import { db } from "../db";
import { wishlist } from "../db/schema/wishlist.schema";
import { eq, and } from "drizzle-orm";

export const getWishlist = async (userId: string) => {
  const wishlistResult = await db
    .select()
    .from(wishlist)
    .where(eq(wishlist.userId, userId));

  return wishlistResult;
};

export const addToWishlist = async (userId: string, propertyId: string) => {
  await db.insert(wishlist).values({ userId, propertyId });
};

export const removeFromWishlist = async (userId: string, propertyId: string) => {
  await db
    .delete(wishlist)
    .where(and(eq(wishlist.userId, userId), eq(wishlist.propertyId, propertyId)));
};

export const isInWishlist = async (userId: string, propertyId: string) => {
  const result = await db
    .select()
    .from(wishlist)
    .where(and(eq(wishlist.userId, userId), eq(wishlist.propertyId, propertyId)));
  return result.length > 0;
};
