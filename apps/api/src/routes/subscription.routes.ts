import { Router, type Router as RouterType } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import * as subscriptionController from "../controllers/subscription.controller";

export const subscriptionRouter: RouterType = Router();

// GET /api/subscription — get subscription data + usage limits
subscriptionRouter.get("/", authMiddleware, subscriptionController.getSubscriptionData);

// POST /api/subscription/sync — sync subscription status with Polar
subscriptionRouter.post("/sync", authMiddleware, subscriptionController.syncSubscription);
