import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import * as configService from "../services/config.service";

// ─── Feature 4: Review Config Controller ────────────────────────────────────

export async function getConfig(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { repositoryId } = req.params;

    const config = await configService.getReviewConfig(repositoryId, userId);

    res.json({ success: true, data: config });
  } catch (error: any) {
    console.error("Error fetching review config:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to fetch config" });
  }
}

export async function updateConfig(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { repositoryId } = req.params;

    const config = await configService.upsertReviewConfig(repositoryId, userId, req.body);

    res.json({ success: true, data: config });
  } catch (error: any) {
    console.error("Error updating review config:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to update config" });
  }
}
