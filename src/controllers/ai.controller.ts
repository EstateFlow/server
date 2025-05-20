import type { Request, Response, NextFunction } from "express";
import * as aiService from "../services/ai.service";

type ExpressHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

export const getSystemPrompts: ExpressHandler = async (req, res) => {
  try {
    const systemPrompts = await aiService.getDefaultSystemPrompt();
    res.status(200).json({
      message: "System prompts retrieved successfully",
      prompts: systemPrompts,
    });
  } catch (error: any) {
    console.error("Error fetching system prompts:", error);
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

export const createConversationWithPropertyAnalysis: ExpressHandler = async (
  req,
  res,
) => {
  try {
    const { userId, title } = req.body;

    if (!userId) {
      res.status(400).json({ message: "Missing required field: userId" });
      return;
    }

    const result = await aiService.createConversationWithPropertyAnalysis(
      userId,
      title,
    );
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
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};
