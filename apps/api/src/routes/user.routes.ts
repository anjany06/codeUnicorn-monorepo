import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import * as userController from "../controllers/user.controller";

export const userRouter = Router();

// GET /api/users/profile
userRouter.get("/profile", authMiddleware, userController.getUserProfile);

// PUT /api/users/profile
userRouter.put("/profile", authMiddleware, userController.updateUserProfile);