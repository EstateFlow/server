import { pgTable, text, uuid, boolean, numeric,
  integer, timestamp, pgEnum, } from 'drizzle-orm/pg-core';
import { users } from './users.schema';

export const propertyTypeEnum = pgEnum('property_type', ['house', 'apartment']);
export const transactionTypeEnum = pgEnum('transaction_type', ['sale', 'rent']);
export const statusEnum = pgEnum('status', ['active', 'inactive', 'sold', 'rented']);

export const properties = pgTable('properties', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: uuid('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  isVerified: boolean('is_verified').default(false),
  title: text('title').notNull(),
  description: text('description'),
  propertyType: propertyTypeEnum('property_type').notNull(),
  transactionType: transactionTypeEnum('transaction_type').notNull(),
  price: numeric('price', { precision: 12, scale: 2 }).notNull(),
  currency: text('currency', { length: 3 }),
  size: numeric('size', { precision: 10, scale: 2 }),
  rooms: integer('rooms'),
  address: text('address').notNull(),
  status: statusEnum('status').default('active'),
  documentUrl: text('document_url'),
  verificationComments: text('verification_comments'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
