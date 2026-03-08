import { Router, type Router as RouterType } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import * as dashboardController from "../controllers/dashboard.controller";

export const dashboardRouter: RouterType = Router();

// GET /api/dashboard/stats
dashboardRouter.get("/stats", authMiddleware, dashboardController.getStats);

// GET /api/dashboard/activity
dashboardRouter.get("/activity", authMiddleware, dashboardController.getMonthlyActivity);


// GET /api/dashboard/developer-metrics  – current-user developer stats
dashboardRouter.get("/developer-metrics", authMiddleware, dashboardController.getDeveloperMetrics);

// GET /api/dashboard/contributions  – contribution heatmap (authenticated)
dashboardRouter.get("/contributions", authMiddleware, dashboardController.getContributionGraph);

// GET /api/dashboard/contributions/:userId  – public embed endpoint (no auth)
dashboardRouter.get("/contributions/:userId", dashboardController.getContributionGraphPublic);