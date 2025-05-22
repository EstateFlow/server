import { pgTable, uuid, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { users } from "./users.schema";
import { systemPrompts } from "./system_prompts.schema";

export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  systemPromptId: uuid("system_prompt_id").references(() => systemPrompts.id, { onDelete: "set null" }),
  title: varchar("title", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});
