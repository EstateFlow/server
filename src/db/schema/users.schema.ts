import {
  pgTable,
  text,
  uuid,
  boolean,
  timestamp,
  integer,
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
  listingLimit: integer("listing_limit"),
  avatarUrl: text("avatar_url").default("https://t4.ftcdn.net/jpg/02/15/84/43/360_F_215844325_ttX9YiIIyeaR7Ne6EaLLjMAmy4GvPC69.jpg"),
  bio: text("bio").default("This section is yet empty."),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
