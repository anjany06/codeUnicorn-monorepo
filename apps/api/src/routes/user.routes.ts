import { Router , type Router as RouterType } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import * as userController from "../controllers/user.controller";

export const userRouter: RouterType = Router();

// GET /api/users/profile
userRouter.get("/profile", authMiddleware, userController.getUserProfile);

// PUT /api/users/profile
userRouter.put("/profile", authMiddleware, userController.updateUserProfile);