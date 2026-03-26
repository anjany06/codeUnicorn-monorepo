import { Router, type Router as RouterType } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import * as reviewController from "../controllers/review.controller";

export const reviewRouter: RouterType = Router();

// GET /api/reviews
reviewRouter.get("/", authMiddleware, reviewController.getReviews);

// GET /api/reviews/:id
reviewRouter.get("/:id", authMiddleware, reviewController.getReviewById);
