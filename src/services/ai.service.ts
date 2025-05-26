import { eq, and } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema/users.schema";
import { conversations } from "../db/schema/conversations.schema";
import { messages } from "../db/schema/messages.schema";
import { v4 as uuidv4 } from "uuid";
import { systemPrompts } from "../db/schema/system_prompts.schema";
import { getProperties } from "./properties.service";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");
const activeChatSessions = new Map();

export const getDefaultSystemPrompt = async () => {
  try {
    const prompt = await db
      .select()
      .from(systemPrompts)
      .where(eq(systemPrompts.isDefault, true))
      .limit(1);

    if (prompt.length === 0) {
      throw new Error("Default system prompt not found");
    }

    if (prompt.length > 1) {
      console.log(
        "Multiple default system prompts found; returning the first one",
      );
    }

    return prompt[0];
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

export const createConversation = async (
  userId: string,
  title: string = "Property Analysis Chat",
) => {
  try {
    const existingConversation = await db
      .select()
      .from(conversations)
      .where(
        and(eq(conversations.userId, userId), eq(conversations.isActive, true)),
      )
      .limit(1);

    if (existingConversation.length > 0) {
      throw new Error("User already has an active conversation");
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
    const propertiesList = await getProperties("active");

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

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: initialMessageContent }],
        },
      ],
    });
    activeChatSessions.set(newConversation[0].id, chat);

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

export const getConversationHistory = async (userId: string) => {
  const user = await db
    .select({ userId: users.id })
    .from(users)
    .where(eq(users.id, userId));

  if (user.length === 0) {
    throw new Error("User with this id does not exist");
  }
  const conversation = await db
    .select()
    .from(conversations)
    .where(
      and(eq(conversations.userId, userId), eq(conversations.isActive, true)),
    );

  if (conversation.length === 0) {
    throw new Error("No active conversation found");
  }

  const conversationId = conversation[0].id;

  const messageHistory = await db
    .select({
      id: messages.id,
      sender: messages.sender,
      content: messages.content,
      createdAt: messages.createdAt,
      isVisible: messages.isVisible,
    })
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt);

  return { messages: messageHistory };
};

export const getVisibleConversationHistory = async (userId: string) => {
  const user = await db
    .select({ userId: users.id })
    .from(users)
    .where(eq(users.id, userId));

  if (user.length === 0) {
    throw new Error("User with this id does not exist");
  }

  const conversation = await db
    .select()
    .from(conversations)
    .where(
      and(eq(conversations.userId, userId), eq(conversations.isActive, true)),
    );

  if (conversation.length === 0) {
    throw new Error("No active conversation found");
  }

  const conversationId = conversation[0].id;

  const messageHistory = await db
    .select({
      id: messages.id,
      sender: messages.sender,
      content: messages.content,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .where(
      and(
        eq(messages.conversationId, conversationId),
        eq(messages.isVisible, true),
      ),
    )
    .orderBy(messages.createdAt);

  return { messages: messageHistory };
};

export const sendMessage = async (userId: string, message: string) => {
  if (!userId) {
    throw new Error("Unauthorized");
  }

  let [conversation] = await db
    .select()
    .from(conversations)
    .where(
      and(eq(conversations.userId, userId), eq(conversations.isActive, true)),
    )
    .limit(1);

  if (!conversation) {
    throw new Error("No active conversation found");
  }

  const userMessage = {
    id: uuidv4(),
    conversationId: conversation.id,
    sender: "user" as const,
    content: message,
    createdAt: new Date(),
    isVisible: true,
  };
  await db.insert(messages).values(userMessage);
  await db
    .update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, conversation.id));

  let chat = activeChatSessions.get(conversation.id);
  if (!chat) {
    const { messages: messageHistory } = await getConversationHistory(userId);

    const history = [];
    for (const msg of messageHistory) {
      if (msg.sender === "system") {
        history.push({
          role: "user",
          parts: [{ text: msg.content }],
        });
      } else if (msg.sender === "user") {
        history.push({
          role: "user",
          parts: [{ text: msg.content }],
        });
      } else if (msg.sender === "ai") {
        history.push({
          role: "model",
          parts: [{ text: msg.content }],
        });
      }
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });
    chat = model.startChat({
      history: history.slice(0, -1),
      generationConfig: {
        maxOutputTokens: 8192,
      },
    });

    activeChatSessions.set(conversation.id, chat);
  }
  const result = await chat.sendMessage(message);
  const response = await result.response;
  const text = response.text();
  console.log("AI Response:", text);

  const aiResponse = {
    id: uuidv4(),
    conversationId: conversation.id,
    sender: "ai" as const,
    content: response.text as string,
    createdAt: new Date(),
    isVisible: true,
  };

  await db.insert(messages).values(aiResponse);
  await db
    .update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, conversation.id));
  return {
    userMessage,
    aiResponse,
  };
};
