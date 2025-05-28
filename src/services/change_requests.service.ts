// src/services/changeRequest.service.ts
import { db } from "../db";
import { changeRequests } from "../db/schema/change_requests.schema";
import { users } from "../db/schema/users.schema";
import { sendChangeConfirmationEmail } from "./email.service";
import { eq } from "drizzle-orm";

function addHours(date: Date, hours: number): Date {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

export const requestEmailChange = async (userId: string, newEmail: string) => {
  const token = crypto.randomUUID();
  const expiresAt = addHours(new Date(), 24);

  await db.insert(changeRequests).values({
    userId,
    type: "email",
    newValue: newEmail,
    token,
    expiresAt,
  });

  await sendChangeConfirmationEmail(newEmail, token, "email");
};

export const requestPasswordChange = async (
  userId: string,
  hashedPassword: string,
  userEmail: string,
) => {
  const token = crypto.randomUUID();
  const expiresAt = addHours(new Date(), 24);

  await db.insert(changeRequests).values({
    userId,
    type: "password",
    newValue: hashedPassword,
    token,
    expiresAt,
  });

  await sendChangeConfirmationEmail(userEmail, token, "password");
};

export const confirmChange = async (token: string) => {
  const [request] = await db
    .select()
    .from(changeRequests)
    .where(eq(changeRequests.token, token));

  if (!request || new Date(request.expiresAt) < new Date()) {
    throw new Error("Invalid or expired token");
  }

  if (request.type === "email") {
    await db
      .update(users)
      .set({ email: request.newValue })
      .where(eq(users.id, request.userId));
  } else if (request.type === "password") {
    await db
      .update(users)
      .set({ passwordHash: request.newValue })
      .where(eq(users.id, request.userId));
  }

  await db.delete(changeRequests).where(eq(changeRequests.id, request.id));
};
