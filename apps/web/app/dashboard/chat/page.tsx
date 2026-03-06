"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  Plus,
  Send,
  Trash2,
  Bot,
  User,
  Loader2,
  Code2,
  GitBranch,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getChatSessions,
  createChatSession,
  getChatMessages,
  deleteChatSession,
  streamChatMessage,
  getConnectedRepositories,
} from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";

interface ChatMessage {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

interface ChatSession {
  id: string;
  title: string;
  repositoryId: string;
  createdAt: string;
  repository?: { fullName: string };
  lastMessage?: string;
}

export default function ChatPage() {
  const queryClient = useQueryClient();
  const [selectedRepoId, setSelectedRepoId] = useState<string>("");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRAFRef = useRef<number | null>(null);

  // Fetch connected repositories
  const { data: repos = [], isLoading: reposLoading } = useQuery({
    queryKey: ["connected-repositories"],
    queryFn: getConnectedRepositories,
  });

  // Fetch chat sessions (filtered by repo if selected)
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["chat-sessions", selectedRepoId],
    queryFn: () => getChatSessions(selectedRepoId || undefined),
  });

  // Fetch messages for active session
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["chat-messages", activeSessionId],
    queryFn: () => getChatMessages(activeSessionId!),
    enabled: !!activeSessionId,
  });

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: (repoId: string) => createChatSession(repoId),
    onSuccess: (session: any) => {
      queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
      setActiveSessionId(session.id);
      // Auto-close sidebar on mobile after creating
      if (window.innerWidth < 768) setSidebarOpen(false);
    },
  });

  // Delete session mutation
  const deleteSessionMutation = useMutation({
    mutationFn: (sessionId: string) => deleteChatSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
      if (activeSessionId) setActiveSessionId(null);
    },
  });

  // Smooth auto-scroll using RAF (no jank during streaming)
  const scrollToBottom = useCallback(() => {
    if (scrollRAFRef.current) cancelAnimationFrame(scrollRAFRef.current);
    scrollRAFRef.current = requestAnimationFrame(() => {
      const container = messagesContainerRef.current;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    });
  }, []);

  // Scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Scroll on streaming content with RAF throttle
  useEffect(() => {
    scrollToBottom();
  }, [streamingContent, scrollToBottom]);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (scrollRAFRef.current) cancelAnimationFrame(scrollRAFRef.current);
    };
  }, []);

  // Handle sending a message with streaming
  const handleSendMessage = useCallback(async () => {
    if (!messageInput.trim() || !activeSessionId || isStreaming) return;

    const userMessage = messageInput.trim();
    setMessageInput("");
    setIsStreaming(true);
    setStreamingContent("");

    // Optimistically add user message to cache
    queryClient.setQueryData(
      ["chat-messages", activeSessionId],
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
      for await (const event of streamChatMessage(
        activeSessionId,
        userMessage,
      )) {
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

      // Refresh messages from server to get persisted data
      queryClient.invalidateQueries({
        queryKey: ["chat-messages", activeSessionId],
      });
      queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsStreaming(false);
      setStreamingContent("");
    }
  }, [messageInput, activeSessionId, isStreaming, queryClient]);

  // Handle keyboard shortcut
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
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
    // Auto-close sidebar on mobile
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  // Truncate title to max 5 words
  const truncateTitle = (title: string, maxWords = 5) => {
    if (!title) return "New Chat";
    const words = title.trim().split(/\s+/);
    if (words.length <= maxWords) return title;
    return words.slice(0, maxWords).join(" ") + "…";
  };

  // Simple markdown-like rendering for code blocks
  const renderMessageContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        const lines = part.slice(3, -3).split("\n");
        const lang = lines[0]?.trim() || "";
        const code = lang ? lines.slice(1).join("\n") : lines.join("\n");
        return (
          <div
            key={i}
            className="my-3 rounded-lg overflow-hidden border border-border"
          >
            {lang && (
              <div className="bg-muted px-3 py-1 text-xs text-muted-foreground font-mono flex items-center gap-1.5">
                <Code2 className="h-3 w-3" />
                {lang}
              </div>
            )}
            <pre className="bg-muted/50 p-3 overflow-x-auto">
              <code className="text-sm font-mono whitespace-pre-wrap wrap-break-word">
                {code}
              </code>
            </pre>
          </div>
        );
      }
      // Render inline code
      const inlineParts = part.split(/(`[^`]+`)/g);
      return (
        <span key={i}>
          {inlineParts.map((ip, j) => {
            if (ip.startsWith("`") && ip.endsWith("`")) {
              return (
                <code
                  key={j}
                  className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono break-all"
                >
                  {ip.slice(1, -1)}
                </code>
              );
            }
            // Handle line breaks
            return ip.split("\n").map((line, k) => (
              <React.Fragment key={`${j}-${k}`}>
                {k > 0 && <br />}
                {line}
              </React.Fragment>
            ));
          })}
        </span>
      );
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] overflow-hidden">
      {/* Header */}
      <div className="shrink-0 mb-3 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-8 w-8"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? (
            <PanelLeftClose className="h-4 w-4" />
          ) : (
            <PanelLeftOpen className="h-4 w-4" />
          )}
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            AI Chat
          </h1>
          <p className="text-sm text-muted-foreground hidden sm:block">
            Chat with AI about your codebase using context-aware RAG
          </p>
        </div>
      </div>

      <div className="flex flex-1 gap-3 min-h-0 overflow-hidden relative">
        {/* Mobile overlay backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Left panel — Session List */}
        <Card
          className={`
            flex flex-col shrink-0 z-40
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
            fixed md:relative inset-y-0 left-0 md:inset-auto
            w-72 md:w-72 lg:w-80
            transition-transform duration-200 ease-in-out
            md:translate-x-0
            h-full
          `}
        >
          <div className="p-3 pb-2 space-y-2 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Sessions</span>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleNewChat}
                  disabled={
                    repos.length === 0 || createSessionMutation.isPending
                  }
                  className="h-7 gap-1 text-xs"
                >
                  <Plus className="h-3 w-3" />
                  New
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 md:hidden"
                  onClick={() => setSidebarOpen(false)}
                >
                  <PanelLeftClose className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            {/* Repo filter */}
            <Select value={selectedRepoId} onValueChange={setSelectedRepoId}>
              <SelectTrigger className="w-full h-8 text-xs">
                <SelectValue placeholder="All repositories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All repositories</SelectItem>
                {repos.map((repo: any) => (
                  <SelectItem key={repo.id} value={repo.id}>
                    <span className="flex items-center gap-1.5">
                      <GitBranch className="h-3 w-3" />
                      {repo.fullName}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Separator />
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {sessionsLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-xs text-muted-foreground">
                    No chat sessions yet.
                    <br />
                    Start a new conversation!
                  </p>
                </div>
              ) : (
                sessions.map((session: ChatSession) => (
                  <div
                    key={session.id}
                    className={`group flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer transition-colors text-sm ${
                      activeSessionId === session.id
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent/50"
                    }`}
                    onClick={() => handleSelectSession(session.id)}
                  >
                    <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p
                        className="truncate font-medium text-xs"
                        title={session.title}
                      >
                        {truncateTitle(session.title)}
                      </p>
                      {session.repository?.fullName && (
                        <p className="truncate text-[10px] text-muted-foreground">
                          {session.repository.fullName}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSessionMutation.mutate(session.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* Right panel — Chat Area */}
        <Card className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {!activeSessionId ? (
            /* Empty state */
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="h-7 w-7 md:h-8 md:w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-semibold">
                    Ask anything about your code
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1 max-w-md">
                    Select a chat session or start a new one. The AI uses your
                    indexed codebase for context-aware answers.
                  </p>
                </div>
                <Button
                  onClick={handleNewChat}
                  disabled={repos.length === 0}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Start a conversation
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Messages area — native scroll for performance */}
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto overscroll-contain p-3 md:p-4"
              >
                <div className="space-y-4 max-w-3xl mx-auto">
                  {messagesLoading ? (
                    <div className="flex justify-center py-12">
                      <Spinner />
                    </div>
                  ) : messages.length === 0 && !streamingContent ? (
                    <div className="text-center py-12">
                      <Bot className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">
                        Send a message to start the conversation
                      </p>
                    </div>
                  ) : (
                    <>
                      {messages.map((msg: ChatMessage) => (
                        <div
                          key={msg.id}
                          className={`flex gap-2 md:gap-3 ${
                            msg.role === "user"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          {msg.role === "assistant" && (
                            <div className="flex h-7 w-7 md:h-8 md:w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                              <Bot className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                            </div>
                          )}
                          <div
                            className={`rounded-lg px-3 md:px-4 py-2.5 md:py-3 max-w-[85%] md:max-w-[80%] text-sm overflow-hidden wrap-break-word ${
                              msg.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            {msg.role === "assistant"
                              ? renderMessageContent(msg.content)
                              : msg.content}
                          </div>
                          {msg.role === "user" && (
                            <div className="flex h-7 w-7 md:h-8 md:w-8 shrink-0 items-center justify-center rounded-full bg-accent">
                              <User className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Streaming response with smooth fade-in */}
                      {streamingContent && (
                        <div className="flex gap-2 md:gap-3 justify-start animate-in fade-in-0 duration-200">
                          <div className="flex h-7 w-7 md:h-8 md:w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <Bot className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                          </div>
                          <div className="rounded-lg px-3 md:px-4 py-2.5 md:py-3 max-w-[85%] md:max-w-[80%] text-sm bg-muted overflow-hidden wrap-break-word">
                            {renderMessageContent(streamingContent)}
                            <span className="inline-block w-1.5 h-4 bg-primary/60 animate-pulse ml-0.5 align-text-bottom rounded-sm" />
                          </div>
                        </div>
                      )}

                      {/* Loading indicator while waiting for stream to start */}
                      {isStreaming && !streamingContent && (
                        <div className="flex gap-2 md:gap-3 justify-start animate-in fade-in-0 duration-300">
                          <div className="flex h-7 w-7 md:h-8 md:w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <Bot className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                          </div>
                          <div className="rounded-lg px-3 md:px-4 py-2.5 md:py-3 bg-muted flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce" />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Input area — always pinned to bottom */}
              <div className="shrink-0 border-t bg-background p-3 md:p-4">
                <div className="flex gap-2 max-w-3xl mx-auto items-end">
                  <Textarea
                    ref={textareaRef}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about your codebase..."
                    className="min-h-[44px] max-h-32 resize-none text-sm"
                    disabled={isStreaming}
                    rows={1}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() || isStreaming}
                    size="icon"
                    className="h-11 w-11 shrink-0"
                  >
                    {isStreaming ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground text-center mt-1.5 hidden md:block">
                  Enter to send · Shift+Enter for new line
                </p>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
