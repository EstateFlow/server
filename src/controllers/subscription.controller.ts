import type { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import * as subscriptionService from "../services/subscription.service";

type ExpressHandler = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => Promise<void>;

export const getSubscriptions: ExpressHandler = async (req, res) => {
  try {
    const subscriptions = await subscriptionService.getSubscriptions();
    res.status(200).json({
      subscriptions,
    });
  } catch (error: any) {
    console.error("Error in getSubscriptions:", error);
    res.status(500).json({
      message: "Failed to fetch subscriptions",
    });
  }
};

export const createSubscriptionOrder: ExpressHandler = async (req, res) => {
  try {
    console.log(req.body);
    const { amount, item } = req.body;
    const order = await subscriptionService.createSubscriptionOrder(
      amount,
      item,
    );
    res.json({ id: order.id });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
};

export const captureSubscriptionOrder: ExpressHandler = async (req, res) => {
  try {
    const { orderId, userId, subscriptionPlanId, email } = req.body;
    const result = await subscriptionService.captureSubscriptionOrder(
      orderId,
      userId,
      subscriptionPlanId,
      email,
    );
    res.json({ status: result.status, id: result.id });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
};
