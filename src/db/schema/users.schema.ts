import {
  pgTable,
  text,
  uuid,
  boolean,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", [
  "renter_buyer",
  "private_seller",
  "agency",
  "moderator",
  "admin",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").unique().notNull(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash"),
  role: roleEnum("role").notNull(),
  isEmailVerified: boolean("is_email_verified").default(false),
  paypalCredentials: text("paypal_credentials"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
