import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import * as configController from "../controllers/config.controller";

export const configRouter: Router = Router();

// Review config per repository
configRouter.get("/:repositoryId/config", authMiddleware, configController.getConfig);
configRouter.put("/:repositoryId/config", authMiddleware, configController.updateConfig);
