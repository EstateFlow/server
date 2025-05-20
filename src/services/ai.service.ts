import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema/users.schema";
import { conversations } from "../db/schema/conversations.schema";
import { messages } from "../db/schema/messages.schema";
import { v4 as uuidv4 } from "uuid";
import { systemPrompts } from "../db/schema/system_prompts.schema";
import { getAllProperties } from "./properties.service";

export const getDefaultSystemPrompt = async () => {
  try {
    const prompts = await db
      .select()
      .from(systemPrompts)
      .where(eq(systemPrompts.isDefault, true))
      .limit(1);

    if (prompts.length === 0) {
      throw new Error("Default system prompt not found");
    }

    if (prompts.length > 1) {
      console.warn(
        "Multiple default system prompts found; returning the first one",
      );
    }

    return prompts[0];
  } catch (error: any) {
    console.error("Error fetching default system prompt:", error);
    throw error;
  }
};

export const updateSystemPrompt = async (
  userId: string,
  name: string,
  newContent: string,
) => {
  try {
    if (!userId || !name || !newContent) {
      throw new Error(
        "Missing required parameters: userId, name, or newContent",
      );
    }

    const [user] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new Error("User not found");
    }

    if (user.role !== "admin") {
      throw new Error("Only admins can update system prompts");
    }

    const [updatedPrompt] = await db
      .update(systemPrompts)
      .set({ content: newContent, updatedAt: new Date() })
      .where(eq(systemPrompts.name, name))
      .returning();

    if (!updatedPrompt) {
      throw new Error("System prompt not found");
    }

    return updatedPrompt;
  } catch (error: any) {
    console.error(
      `Error updating system prompt (userId: ${userId}, name: ${name}):`,
      error,
    );
    throw error;
  }
};

export const createConversationWithPropertyAnalysis = async (
  userId: string,
  title: string = "Property Analysis Chat",
) => {
  try {
    if (!userId) {
      throw new Error("Missing required parameter: userId");
    }

    const [user] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new Error("User not found");
    }

    const defaultPrompt = await getDefaultSystemPrompt();
    const propertiesList = await getAllProperties();

    if (propertiesList.length === 0) {
      throw new Error("No properties found for analysis");
    }

    const propertiesSummary = propertiesList
      .map(
        (p) => `
      - ID: ${p.id}
      - Title: ${p.title || "Unknown"}
      - Type: ${p.propertyType || "Unknown"}
      - Transaction: ${p.transactionType || "Unknown"}
      - Price: ${p.price ? `${p.price} ${p.currency}` : "Unknown"}
      - Size: ${p.size ? `${p.size} sqm` : "Unknown"}
      - Rooms: ${p.rooms || "Unknown"}
      - Address: ${p.address || "Unknown"}
      - Status: ${p.status || "Unknown"}
      - Is Verified: ${p.isVerified ? "Yes" : "No"}
      - Images: ${p.images?.length || 0} images
      - Pricing History: ${
        p.pricingHistory?.length
          ? p.pricingHistory
              .map((ph) => `${ph.price} ${ph.currency} on ${ph.effectiveDate}`)
              .join(", ")
          : "None"
      }
    `,
      )
      .join("\n");

    const initialMessageContent = `
      ${defaultPrompt.content}

      ### Available Properties:
      ${propertiesSummary}
    `;

    const newConversation = await db
      .insert(conversations)
      .values({
        id: uuidv4(),
        userId,
        systemPromptId: defaultPrompt.id,
        title,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      })
      .returning();

    const newMessage = await db
      .insert(messages)
      .values({
        id: uuidv4(),
        conversationId: newConversation[0].id,
        sender: "system",
        content: initialMessageContent,
        createdAt: new Date(),
        isVisible: false,
      })
      .returning();

    return {
      conversation: newConversation[0],
      initialMessage: newMessage[0],
    };
  } catch (error: any) {
    console.error(
      `Error creating conversation (userId: ${userId}, title: ${title}):`,
      error,
    );
    throw error;
  }
};
