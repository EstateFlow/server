import { pgTable, uuid, varchar, timestamp, text } from "drizzle-orm/pg-core";
import { users } from "./users.schema";

export const changeRequests = pgTable("change_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  type: varchar("type", { length: 10 }).notNull(),
  newValue: text("new_value").notNull(),
  token: uuid("token").defaultRandom().notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

