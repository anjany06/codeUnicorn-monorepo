import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import * as chatService from "../services/chat.service";

// ─── Feature 2: AI Codebase Chat Controller ────────────────────────────────

export async function createSession(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { repositoryId, title } = req.body;

    if (!repositoryId) {
      return res.status(400).json({ success: false, error: "repositoryId is required" });
    }

    const session = await chatService.createChatSession(userId, repositoryId, title);
    res.json({ success: true, data: session });
  } catch (error: any) {
    console.error("Error creating chat session:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to create chat session" });
  }
}

export async function getSessions(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const repositoryId = req.query.repositoryId as string | undefined;

    const sessions = await chatService.getChatSessions(userId, repositoryId);
    res.json({ success: true, data: sessions });
  } catch (error: any) {
    console.error("Error fetching chat sessions:", error);
    res.status(500).json({ success: false, error: "Failed to fetch chat sessions" });
  }
}

export async function getMessages(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const sessionId = req.params.sessionId as string;

    const messages = await chatService.getChatMessages(sessionId, userId);
    res.json({ success: true, data: messages });
  } catch (error: any) {
    console.error("Error fetching chat messages:", error);
    res.status(500).json({ success: false, error: "Failed to fetch messages" });
  }
}

export async function deleteSession(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const sessionId = req.params.sessionId as string;

    await chatService.deleteChatSession(sessionId, userId);
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting chat session:", error);
    res.status(500).json({ success: false, error: "Failed to delete chat session" });
  }
}

/**
 * Send a message and stream the AI response via SSE (Server-Sent Events).
 */
export async function sendMessage(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const sessionId = req.params.sessionId as string;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, error: "message is required" });
    }

    const { result, sessionId: sid } = await chatService.streamChatResponse(
      sessionId,
      userId,
      message
    );

    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    // Flush headers immediately for proxy bypass
    res.flushHeaders();

    let fullResponse = "";

    // Stream the response
    const stream = result.textStream;
    for await (const chunk of stream) {
      fullResponse += chunk;
      res.write(`data: ${JSON.stringify({ type: "chunk", content: chunk })}\n\n`);
    }

    // Save the complete assistant message
    await chatService.saveAssistantMessage(sid, fullResponse);

    // Send completion event
    res.write(`data: ${JSON.stringify({ type: "done", content: fullResponse })}\n\n`);
    res.end();
  } catch (error: any) {
    console.error("Error in chat stream:", error);

    if (error?.name === "ChatRateLimitError" || error?.statusCode === 429) {
      return res.status(429).json({
        success: false,
        error: "RATE_LIMIT_EXCEEDED",
        message:
          error.message ||
          "Free plan limit reached: 10 messages per 8 hours. Please try again later.",
        data: error.details || null,
      });
    }

    // If headers already sent (streaming started), close the stream
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ type: "error", content: error.message })}\n\n`);
      res.end();
    } else {
      res.status(500).json({ success: false, error: error.message || "Failed to stream response" });
    }
  }
}
