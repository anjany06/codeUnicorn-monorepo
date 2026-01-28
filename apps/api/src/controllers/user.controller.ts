import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import * as userService from "../services/user.service";

export async function getUserProfile(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;

    const profile = await userService.getUserProfileById(userId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Error getting user profile:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get profile",
    });
  }
}

export async function updateUserProfile(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { name, email } = req.body;

    const updatedProfile = await userService.updateUserProfileById(userId, {
      name,
      email,
    });

    res.json({
      success: true,
      data: updatedProfile,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update profile",
    });
  }
}