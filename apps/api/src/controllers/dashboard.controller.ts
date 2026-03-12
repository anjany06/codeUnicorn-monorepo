import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import * as dashboardService from "../services/dashboard.service";



export async function getDeveloperMetrics(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const data = await dashboardService.getDeveloperMetrics(userId);
    res.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching developer metrics:", error);
    res.status(500).json({ success: false, error: "Failed to fetch developer metrics" });
  }
}

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

export async function getContributionGraph(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const data = await dashboardService.getContributionGraph(userId);
    res.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching contribution graph:", error);
    res.status(500).json({ success: false, error: "Failed to fetch contribution graph" });
  }
}

export async function getContributionGraphPublic(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    if (!userId || Array.isArray(userId)) {
      res.status(400).json({ success: false, error: "Invalid userId" });
      return;
    }
    const data = await dashboardService.getContributionGraphPublic(userId);
    res.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching public contribution graph:", error);
    res.status(500).json({ success: false, error: "Failed to fetch contribution graph" });
  }
}
