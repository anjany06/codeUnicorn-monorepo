import { prisma } from "@codeunicorn/database";
import { retrieveContext } from "@codeunicorn/ai";
import { streamText } from "ai";
import { google } from "@ai-sdk/google";

// ─── Feature 2: AI Codebase Chat ────────────────────────────────────────────

export async function createChatSession(userId: string, repositoryId: string, title?: string) {
  // Verify the user owns this repository
  const repository = await prisma.repository.findFirst({
    where: { id: repositoryId, userId },
  });

  if (!repository) {
    throw new Error("Repository not found or not owned by user");
  }

  const session = await prisma.chatSession.create({
    data: {
      repositoryId,
      userId,
      title: title || `Chat about ${repository.name}`,
    },
  });

  return session;
}

export async function getChatSessions(userId: string, repositoryId?: string) {
  const where: any = { userId };
  if (repositoryId) where.repositoryId = repositoryId;

  const sessions = await prisma.chatSession.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      repository: {
        select: { name: true, owner: true, fullName: true },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1, // Last message for preview
      },
    },
  });

  return sessions;
}

export async function getChatMessages(sessionId: string, userId: string) {
  // Verify ownership
  const session = await prisma.chatSession.findFirst({
    where: { id: sessionId, userId },
  });

  if (!session) {
    throw new Error("Chat session not found");
  }

  const messages = await prisma.chatMessage.findMany({
    where: { chatSessionId: sessionId },
    orderBy: { createdAt: "asc" },
  });

  return messages;
}

export async function deleteChatSession(sessionId: string, userId: string) {
  const session = await prisma.chatSession.findFirst({
    where: { id: sessionId, userId },
  });

  if (!session) {
    throw new Error("Chat session not found");
  }

  await prisma.chatSession.delete({
    where: { id: sessionId },
  });

  return { success: true };
}

/**
 * Stream a chat response using RAG context from the indexed codebase.
 * Returns a ReadableStream for SSE streaming to the client.
 */
export async function streamChatResponse(
  sessionId: string,
  userId: string,
  userMessage: string
) : Promise<{ result: ReturnType<typeof streamText>; sessionId: string }> {
  // Verify ownership and get repository info
  const session = await prisma.chatSession.findFirst({
    where: { id: sessionId, userId },
    include: {
      repository: { select: { name: true, owner: true, fullName: true } },
    },
  });

  if (!session) {
    throw new Error("Chat session not found");
  }

  // Save the user message
  await prisma.chatMessage.create({
    data: {
      chatSessionId: sessionId,
      role: "user",
      content: userMessage,
    },
  });

  // Update session title if it's the first message
  const messageCount = await prisma.chatMessage.count({
    where: { chatSessionId: sessionId },
  });
  if (messageCount === 1) {
    // Use the first user message as the title (truncated)
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { title: userMessage.slice(0, 80) },
    });
  }

  // Get last 10 messages for conversation context
  const recentMessages = await prisma.chatMessage.findMany({
    where: { chatSessionId: sessionId },
    orderBy: { createdAt: "asc" },
    take: 20,
  });

  // Retrieve RAG context from the indexed codebase
  const repoFullName = session.repository.fullName;
  const codebaseContext = await retrieveContext(userMessage, repoFullName, 8);

  // Build the conversation messages
  const systemPrompt = `You are CodeUnicorn AI, an expert code assistant that has deep knowledge of the "${session.repository.name}" repository (${repoFullName}).

You have been given relevant code snippets from the repository as context. Use this context to give accurate, specific answers about the codebase. Reference actual file paths, function names, and code patterns when relevant.

RELEVANT CODEBASE CONTEXT:
${codebaseContext.length > 0 ? codebaseContext.join("\n\n---\n\n") : "No relevant code context found for this query."}

GUIDELINES:
- Be specific and reference actual code from the context
- If you don't know something or the context doesn't contain relevant info, say so
- Format code snippets with proper syntax highlighting
- Be concise but thorough
- When suggesting changes, explain the reasoning`;

  const conversationMessages = recentMessages.map((msg) => ({
    role: msg.role as "user" | "assistant",
    content: msg.content,
  }));

  // Stream the response using Vercel AI SDK
  const result = streamText({
    model: google("gemini-2.5-flash"),
    system: systemPrompt,
    messages: conversationMessages,
  });

  return { result, sessionId };
}

/**
 * Save the assistant's response after streaming completes
 */
export async function saveAssistantMessage(sessionId: string, content: string) {
  await prisma.chatMessage.create({
    data: {
      chatSessionId: sessionId,
      role: "assistant",
      content,
    },
  });

  // Update session's updatedAt
  await prisma.chatSession.update({
    where: { id: sessionId },
    data: { updatedAt: new Date() },
  });
}
