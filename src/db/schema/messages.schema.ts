import { pgTable, uuid, text, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { conversations } from "./conversations.schema";
import { properties } from "./properties.schema";

export const senderEnum = pgEnum("sender", ["user", "ai", "system"]);

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id").references(() => conversations.id, { onDelete: "cascade" }).notNull(),
  sender: senderEnum("sender").notNull(),
  content: text("content").notNull(),
  tokenCount: integer("token_count"),
  isVisible: boolean("is_visible").default(true).notNull(),
  propertyId: uuid("property_id").references(() => properties.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
