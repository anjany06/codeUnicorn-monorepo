import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import * as chatController from "../controllers/chat.controller";

export const chatRouter: Router = Router();

// Chat sessions
chatRouter.get("/sessions", authMiddleware, chatController.getSessions);
chatRouter.post("/sessions", authMiddleware, chatController.createSession);
chatRouter.delete("/sessions/:sessionId", authMiddleware, chatController.deleteSession);

// Chat messages
chatRouter.get("/sessions/:sessionId/messages", authMiddleware, chatController.getMessages);
chatRouter.post("/sessions/:sessionId/messages", authMiddleware, chatController.sendMessage);
