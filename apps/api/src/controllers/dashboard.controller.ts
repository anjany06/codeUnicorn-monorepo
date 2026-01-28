import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import * as dashboardService from "../services/dashboard.service";

export async function getStats(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;

    const stats = await dashboardService.getDashboardStats(userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch dashboard stats",
    });
  }
}

export async function getMonthlyActivity(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;

    const activity = await dashboardService.getMonthlyActivity(userId);

    res.json({
      success: true,
      data: activity,
    });
  } catch (error) {
    console.error("Error fetching monthly activity:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch monthly activity",
    });
  }
}