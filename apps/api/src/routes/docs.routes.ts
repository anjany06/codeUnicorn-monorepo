import { Router, type Router as RouterType } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { getDocs, getDoc, triggerGenerate } from "../controllers/docs.controller";

export const docsRouter: RouterType = Router();

docsRouter.use(authMiddleware);

// GET /api/docs/:repositoryId         — list all docs for a repo
// POST /api/docs/:repositoryId/generate — trigger generation
// GET /api/docs/:repositoryId/:docType  — get a specific doc

docsRouter.get("/:repositoryId", getDocs);
docsRouter.post("/:repositoryId/generate", triggerGenerate);
docsRouter.get("/:repositoryId/:docType", getDoc);
