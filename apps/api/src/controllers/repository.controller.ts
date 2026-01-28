import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import * as repositoryService from "../services/repository.service";

export async function getRepositories(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const perPage = parseInt(req.query.perPage as string) || 10;

    const repositories = await repositoryService.fetchRepositories(userId, page, perPage);

    res.json({
      success: true,
      data: repositories,
    });
  } catch (error) {
    console.error("Error fetching repositories:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch repositories",
    });
  }
}

export async function connectRepository(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { owner, repo, githubId } = req.body;

    if (!owner || !repo || !githubId) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: owner, repo, githubId",
      });
    }

    const repository = await repositoryService.connectRepository(
      userId,
      owner,
      repo,
      githubId
    );

    res.json({
      success: true,
      data: repository,
      message: "Repository connected successfully",
    });
  } catch (error: any) {
    console.error("Error connecting repository:", error);
    res.status(400).json({
      success: false,
      error: error.message || "Failed to connect repository",
    });
  }
}

export async function disconnectRepository(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    await repositoryService.disconnectRepository(userId, id);

    res.json({
      success: true,
      message: "Repository disconnected successfully",
    });
  } catch (error: any) {
    console.error("Error disconnecting repository:", error);
    res.status(400).json({
      success: false,
      error: error.message || "Failed to disconnect repository",
    });
  }
}