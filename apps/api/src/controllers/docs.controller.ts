import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import * as docsService from "../services/docs.service";

export async function getDocs(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const repositoryId = req.params.repositoryId as string;
    const docs = await docsService.getGeneratedDocs(repositoryId, userId);
    res.json({ success: true, data: docs });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
}

export async function getDoc(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const repositoryId = req.params.repositoryId as string;
    const docType = req.params.docType as string;
    const doc = await docsService.getGeneratedDoc(repositoryId, docType, userId);
    if (!doc) return res.status(404).json({ success: false, error: "Doc not found" });
    res.json({ success: true, data: doc });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
}

export async function triggerGenerate(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const repositoryId = req.params.repositoryId as string;
    const { docType } = req.body;
    if (!docType) return res.status(400).json({ success: false, error: "docType is required" });
    const doc = await docsService.triggerDocGeneration(repositoryId, docType, userId);
    res.json({ success: true, data: doc });
  } catch (error: any) {
    res.status(error.statusCode || (error.message.includes("Invalid") ? 400 : 500)).json({
      success: false,
      error: error.message,
    });
  }
}
