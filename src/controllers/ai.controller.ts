import type { Request, Response, NextFunction } from "express";
import * as aiService from "../services/ai.service";

type ExpressHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

export const getSystemPrompt: ExpressHandler = async (req, res) => {
  try {
    const systemPrompt = await aiService.getDefaultSystemPrompt();
    res.status(200).json({
      message: "System prompt retrieved successfully",
      prompts: systemPrompt,
    });
  } catch (error: any) {
    console.error("Error fetching system prompt:", error);
    if (error.message === "Default system prompt not found") {
      res.status(404).json({ message: "Default system prompt not found" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

export const updateSystemPrompt: ExpressHandler = async (req, res) => {
  try {
    const { userId, name, newContent } = req.body;

    if (!userId || !name || !newContent) {
      res.status(400).json({
        message: "Missing required fields: userId, name, or newContent",
      });
      return;
    }

    const updatedPrompt = await aiService.updateSystemPrompt(
      userId,
      name,
      newContent,
    );
    res.status(200).json({
      message: "System prompt updated successfully",
      prompt: updatedPrompt,
    });
  } catch (error: any) {
    console.error(
      `Error updating system prompt (userId: ${req.body.userId}, name: ${req.body.name}):`,
      error,
    );
    if (error.message === "Only admins can update system prompts") {
      res
        .status(403)
        .json({ message: "Only admins can update system prompts" });
    } else if (error.message === "System prompt not found") {
      res.status(404).json({ message: "System prompt not found" });
    } else if (error.message === "User not found") {
      res.status(404).json({ message: "User not found" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

export const createConversation: ExpressHandler = async (req, res) => {
  try {
    const { userId, title } = req.body;

    if (!userId) {
      res.status(400).json({ message: "Missing required field: userId" });
      return;
    }

    const result = await aiService.createConversation(userId, title);
    res.status(201).json({
      message: "Conversation created with property analysis",
      conversation: result.conversation,
      initialMessage: result.initialMessage,
    });
  } catch (error: any) {
    console.error(
      `Error creating conversation (userId: ${req.body.userId}):`,
      error,
    );
    if (error.message === "User not found") {
      res.status(404).json({ message: "User not found" });
    } else if (error.message === "Default system prompt not found") {
      res.status(404).json({ message: "Default system prompt not found" });
    } else if (error.message === "User already has an active conversation") {
      res
        .status(409)
        .json({ message: "User already has an active conversation" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

export const getConversationHistory: ExpressHandler = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({ message: "Missing required field: userId" });
      return;
    }

    const messages = await aiService.getConversationHistory(userId);
    res.json({ messages });
  } catch (error: any) {
    console.error("Error fetching conversation history:", error);
    if (error.message === "User with this id does not exist") {
      res.status(404).json({ message: "User with this id does not exist" });
    } else if (error.message === "No active conversation found") {
      res.status(404).json({ message: "No active conversation found" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

export const sendMessage: ExpressHandler = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId, message } = req.body;

    if (!userId || !message || !conversationId) {
      res.status(400).json({
        message: "Missing required fields: userId, message, or conversationId",
      });
      return;
    }

    const result = await aiService.sendMessage(userId, message);
    res.status(200).json({
      message: "Message sent successfully",
      userMessage: result.userMessage,
      aiResponse: result.aiResponse,
    });
  } catch (error: any) {
    console.error("Error sending message:", error);
    if (error.message === "Unauthorized") {
      res.status(401).json({ message: "Unauthorized" });
    } else if (error.message === "No active conversation found") {
      res.status(404).json({ message: "No active conversation found" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};
