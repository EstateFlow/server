import { InferSelectModel } from "drizzle-orm";
import { properties } from "../db/schema/properties.schema";
import { propertyImages } from "../db/schema/property_images.schema";
import { propertyViews } from "../db/schema/property_views.schema";
import { pricingHistory } from "../db/schema/pricing_history.schema";
import { users } from "../db/schema/users.schema";

export type Property = InferSelectModel<typeof properties>;
export type PropertyImage = InferSelectModel<typeof propertyImages>;
export type PropertyView = InferSelectModel<typeof propertyViews>;
export type PricingHistory = InferSelectModel<typeof pricingHistory>;
export type User = InferSelectModel<typeof users>;

export interface PropertyWithRelations extends Property {
  images: PropertyImage[];
  views: PropertyView[];
  pricingHistory: PricingHistory[];
  owner: User | null;
}

export interface CreatePropertyInput {
  ownerId: string;
  title: string;
  description?: string;
  propertyType: "house" | "apartment";
  transactionType: "sale" | "rent";
  price: string;
  currency?: string;
  size?: string;
  rooms?: number;
  address: string;
  status?: "active" | "inactive" | "sold" | "rented";
  documentUrl?: string;
  verificationComments?: string;
  images?: { imageUrl: string; isPrimary: boolean }[];
}

export interface UpdatePropertyInput {
  title?: string;
  description?: string;
  propertyType?: "house" | "apartment";
  transactionType?: "sale" | "rent";
  price?: string;
  currency?: string;
  size?: string;
  rooms?: number;
  address?: string;
  status?: "active" | "inactive" | "sold" | "rented";
  documentUrl?: string;
  verificationComments?: string;
  isVerified?: boolean;
  images?: { imageUrl: string; isPrimary: boolean }[];
}
