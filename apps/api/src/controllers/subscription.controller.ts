import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import * as subscriptionService from "../services/subscription.service";

export async function getSubscriptionData(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const data = await subscriptionService.getSubscriptionData(userId);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching subscription data:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch subscription data",
    });
  }
}

export async function syncSubscription(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const result = await subscriptionService.syncSubscriptionStatus(userId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error syncing subscription:", error);
    res.status(500).json({
      success: false,
      error: "Failed to sync subscription",
    });
  }
}
