import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import * as reviewService from "../services/review.service";

export async function getReviews(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;

    const reviews = await reviewService.getReviews(userId);

    res.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch reviews",
    });
  }
}
