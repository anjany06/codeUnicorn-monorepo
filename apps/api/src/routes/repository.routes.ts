import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import * as repositoryController from "../controllers/repository.controller";

export const repositoryRouter = Router();

// GET /api/repositories
repositoryRouter.get("/", authMiddleware, repositoryController.getRepositories);

// POST /api/repositories/connect
repositoryRouter.post("/connect", authMiddleware, repositoryController.connectRepository);

// DELETE /api/repositories/:id
repositoryRouter.delete("/:id", authMiddleware, repositoryController.disconnectRepository);