import { db } from "../db";
import { pricingHistory } from "../db/schema/pricing_history.schema";
import { properties } from "../db/schema/properties.schema";
import { propertyImages } from "../db/schema/property_images.schema";
import { propertyViews } from "../db/schema/property_views.schema";
import { eq, inArray, InferSelectModel } from "drizzle-orm";

type Property = InferSelectModel<typeof properties>;
type PropertyImage = InferSelectModel<typeof propertyImages>;
type PropertyView = InferSelectModel<typeof propertyViews>;
type PricingHistory = InferSelectModel<typeof pricingHistory>;

interface PropertyWithRelations extends Property {
  images: PropertyImage[];
  views: PropertyView[];
  pricingHistory: PricingHistory[];
}

interface CreatePropertyInput {
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

export const getAllProperties = async (): Promise<PropertyWithRelations[]> => {
  const propertiesList = await db.select().from(properties);
  if (propertiesList.length === 0) {
    return [];
  }

  const propertyIds = propertiesList.map((p) => p.id);

  const [images, views, pricing] = await Promise.all([
    db
      .select()
      .from(propertyImages)
      .where(inArray(propertyImages.propertyId, propertyIds)),
    db
      .select()
      .from(propertyViews)
      .where(inArray(propertyViews.propertyId, propertyIds)),
    db
      .select()
      .from(pricingHistory)
      .where(inArray(pricingHistory.propertyId, propertyIds)),
  ]);

  return propertiesList.map((property) => ({
    ...property,
    images: images.filter((img) => img.propertyId === property.id),
    views: views.filter((view) => view.propertyId === property.id),
    pricingHistory: pricing.filter((p) => p.propertyId === property.id),
  }));
};

export const getCertainProperty = async (
  propertyId: string,
): Promise<PropertyWithRelations> => {
  const property = await db
    .select({
      property: properties,
      image: propertyImages,
      view: propertyViews,
      pricing: pricingHistory,
    })
    .from(properties)
    .where(eq(properties.id, propertyId))
    .leftJoin(propertyImages, eq(properties.id, propertyImages.propertyId))
    .leftJoin(propertyViews, eq(properties.id, propertyViews.propertyId))
    .leftJoin(pricingHistory, eq(properties.id, pricingHistory.propertyId));

  if (property.length === 0) {
    throw new Error(`Property with ID ${propertyId} not found`);
  }

  const propertyWithRelations = property.reduce(
    (acc: PropertyWithRelations, row) => {
      const { property, image, view, pricing } = row;

      if (!acc.id) {
        acc = { ...property, images: [], views: [], pricingHistory: [] };
      }

      if (image) acc.images.push(image);
      if (view) acc.views.push(view);
      if (pricing) acc.pricingHistory.push(pricing);

      return acc;
    },
    {} as PropertyWithRelations,
  );

  return propertyWithRelations;
};

export const addNewProperty = async (input: CreatePropertyInput) => {
  const newProperty = await db
    .insert(properties)
    .values({
      ownerId: input.ownerId,
      title: input.title,
      description: input.description,
      propertyType: input.propertyType,
      transactionType: input.transactionType,
      price: input.price,
      currency: input.currency || "USD",
      size: input.size,
      rooms: input.rooms,
      address: input.address,
      status: input.status || "active",
      documentUrl: input.documentUrl,
      verificationComments: input.verificationComments,
    })
    .returning();

  const property = newProperty[0];

  let images: PropertyImage[] = [];
  if (input.images && input.images.length > 0) {
    images = await db
      .insert(propertyImages)
      .values(
        input.images.map((img) => ({
          propertyId: property.id,
          imageUrl: img.imageUrl,
          isPrimary: img.isPrimary,
        })),
      )
      .returning();
  }

  const pricingHistoryRecord = await db
    .insert(pricingHistory)
    .values({
      propertyId: property.id,
      price: input.price,
      currency: input.currency || "USD",
      effectiveDate: new Date(),
    })
    .returning();

  return {
    ...property,
    images,
    views: [],
    pricingHistory: pricingHistoryRecord,
  };
};
