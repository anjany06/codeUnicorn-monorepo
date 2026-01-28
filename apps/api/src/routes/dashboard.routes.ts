import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import * as dashboardController from "../controllers/dashboard.controller";

export const dashboardRouter = Router();

// GET /api/dashboard/stats
dashboardRouter.get("/stats", authMiddleware, dashboardController.getStats);

// GET /api/dashboard/activity
dashboardRouter.get("/activity", authMiddleware, dashboardController.getMonthlyActivity);