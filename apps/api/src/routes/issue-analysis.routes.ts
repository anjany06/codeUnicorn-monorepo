import { Router, type Router as RouterType } from "express";
import { Response } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";
import { prisma } from "@codeunicorn/database";

export const issueAnalysisRouter: RouterType = Router();

issueAnalysisRouter.use(authMiddleware);

// GET /api/issue-analyses/:repositoryId — recent issue analyses
issueAnalysisRouter.get(
  "/:repositoryId",
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const repositoryId = req.params.repositoryId as string;

      // Verify ownership
      const repository = await prisma.repository.findFirst({
        where: { id: repositoryId, userId },
      });
      if (!repository) {
        return res.status(404).json({ success: false, error: "Repository not found" });
      }

      const analyses = await prisma.issueAnalysis.findMany({
        where: { repositoryId },
        orderBy: { createdAt: "desc" },
        take: 20,
      });

      res.json({ success: true, data: analyses });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// GET /api/issue-analyses/recent — all issue analyses across user's repos
issueAnalysisRouter.get(
  "/",
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;

      const analyses = await prisma.issueAnalysis.findMany({
        where: { repository: { userId } },
        include: { repository: { select: { fullName: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      });

      res.json({ success: true, data: analyses });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);
