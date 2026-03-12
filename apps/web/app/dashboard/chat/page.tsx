"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createChatSession,
  deleteChatSession,
  getChatMessages,
  getChatSessions,
  getConnectedRepositories,
  streamChatMessage,
} from "@/lib/api";
import { ChatEmptyState } from "./_components/chat-empty-state";
import { ChatHeader } from "./_components/chat-header";
import { ChatInput } from "./_components/chat-input";
import { ChatMessages } from "./_components/chat-messages";
import { ChatSidebar } from "./_components/chat-sidebar";
import { ChatMessage, ChatRepository, ChatSession } from "./_components/types";

export default function ChatPage() {
  const queryClient = useQueryClient();
  const [selectedRepoId, setSelectedRepoId] = useState<string>("");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRAFRef = useRef<number | null>(null);

  const { data: repos = [] } = useQuery({
    queryKey: ["connected-repositories"],
    queryFn: getConnectedRepositories,
  });

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["chat-sessions", selectedRepoId],
    queryFn: () => getChatSessions(selectedRepoId || undefined),
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["chat-messages", activeSessionId],
    queryFn: () => getChatMessages(activeSessionId!),
    enabled: !!activeSessionId,
  });

  const createSessionMutation = useMutation({
    mutationFn: (repoId: string) => createChatSession(repoId),
    onSuccess: (session: any) => {
      queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
      setActiveSessionId(session.id);
      if (window.innerWidth < 768) setSidebarOpen(false);
    },
  });

  const deleteSessionMutation = useMutation({
    mutationFn: (sessionId: string) => deleteChatSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
      if (activeSessionId) setActiveSessionId(null);
    },
  });

  const scrollToBottom = useCallback(() => {
    if (scrollRAFRef.current) cancelAnimationFrame(scrollRAFRef.current);
    scrollRAFRef.current = requestAnimationFrame(() => {
      const container = messagesContainerRef.current;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [streamingContent, scrollToBottom]);

  useEffect(() => {
    return () => {
      if (scrollRAFRef.current) cancelAnimationFrame(scrollRAFRef.current);
    };
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!messageInput.trim() || !activeSessionId || isStreaming) return;

    const userMessage = messageInput.trim();
    const messageQueryKey = ["chat-messages", activeSessionId] as const;
    setMessageInput("");
    setIsStreaming(true);
    setStreamingContent("");
    setSendError(null);

    queryClient.setQueryData(
      messageQueryKey,
      (old: ChatMessage[] = []) => [
        ...old,
        {
          id: `temp-${Date.now()}`,
          role: "user",
          content: userMessage,
          createdAt: new Date().toISOString(),
        },
      ],
    );

    try {
      let fullContent = "";
      for await (const event of streamChatMessage(activeSessionId, userMessage)) {
        if (event.type === "chunk") {
          fullContent += event.content;
          setStreamingContent(fullContent);
        } else if (event.type === "done") {
          break;
        } else if (event.type === "error") {
          console.error("Stream error:", event.content);
          break;
        }
      }

      await queryClient.refetchQueries({
        queryKey: messageQueryKey,
        type: "active",
      });

      if (fullContent.trim()) {
        const latestMessages =
          queryClient.getQueryData<ChatMessage[]>(messageQueryKey) ?? [];
        const hasAssistantReply = latestMessages.some(
          (m) => m.role === "assistant" && m.content.trim() === fullContent.trim(),
        );

        if (!hasAssistantReply) {
          queryClient.setQueryData(
            messageQueryKey,
            (old: ChatMessage[] = []) => [
              ...old,
              {
                id: `temp-assistant-${Date.now()}`,
                role: "assistant",
                content: fullContent,
                createdAt: new Date().toISOString(),
              },
            ],
          );
        }
      }

      queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
    } catch (err) {
      console.error("Failed to send message:", err);
      const message =
        err instanceof Error ? err.message : "Failed to send message";
      setSendError(message);
    } finally {
      setIsStreaming(false);
      setStreamingContent("");
    }
  }, [messageInput, activeSessionId, isStreaming, queryClient]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewChat = () => {
    const repoId = selectedRepoId || repos[0]?.id;
    if (!repoId) return;
    createSessionMutation.mutate(repoId);
  };

  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] overflow-hidden">
      <ChatHeader
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex flex-1 gap-3 min-h-0 overflow-hidden relative">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <ChatSidebar
          sidebarOpen={sidebarOpen}
          selectedRepoId={selectedRepoId}
          repos={repos as ChatRepository[]}
          sessions={sessions as ChatSession[]}
          sessionsLoading={sessionsLoading}
          activeSessionId={activeSessionId}
          isCreatingSession={createSessionMutation.isPending}
          onCloseSidebar={() => setSidebarOpen(false)}
          onSelectRepo={setSelectedRepoId}
          onNewChat={handleNewChat}
          onSelectSession={handleSelectSession}
          onDeleteSession={(sessionId) => deleteSessionMutation.mutate(sessionId)}
        />

        <Card className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {!activeSessionId ? (
            <ChatEmptyState
              isCreatingSession={createSessionMutation.isPending}
              hasConnectedRepos={repos.length > 0}
              onNewChat={handleNewChat}
            />
          ) : (
            <>
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto overscroll-contain p-3 md:p-4"
              >
                <div className="space-y-4 max-w-3xl mx-auto">
                  <ChatMessages
                    messagesLoading={messagesLoading}
                    messages={messages as ChatMessage[]}
                    streamingContent={streamingContent}
                    isStreaming={isStreaming}
                  />
                </div>
              </div>

              <ChatInput
                messageInput={messageInput}
                isStreaming={isStreaming}
                sendError={sendError}
                textareaRef={textareaRef}
                onMessageChange={setMessageInput}
                onKeyDown={handleKeyDown}
                onSend={handleSendMessage}
              />
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
