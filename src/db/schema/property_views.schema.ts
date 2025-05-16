import { pgTable, uuid, timestamp } from 'drizzle-orm/pg-core';
import { properties } from './properties.schema';
import { users } from './users.schema';

export const propertyViews = pgTable('property_views', {
  id: uuid('id').primaryKey().defaultRandom(),
  propertyId: uuid('property_id').references(() => properties.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  viewedAt: timestamp('viewed_at', { withTimezone: true }).defaultNow().notNull(),
});
