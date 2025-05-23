import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema/users.schema";

export const sendNotification = async (userId: string) => {
  const user = await db
    .select({
      email: users.email,
      username: users.username,
    })
    .from(users)
    .where(eq(users.id, userId));

  return;
};
