import { Bot, User } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { ChatMarkdown } from "./chat-markdown";
import { ChatMessage } from "./types";

type ChatMessagesProps = {
  messagesLoading: boolean;
  messages: ChatMessage[];
  streamingContent: string;
  isStreaming: boolean;
};

export function ChatMessages({
  messagesLoading,
  messages,
  streamingContent,
  isStreaming,
}: ChatMessagesProps) {
  if (messagesLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (messages.length === 0 && !streamingContent) {
    return (
      <div className="text-center py-12">
        <Bot className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          Send a message to start the conversation
        </p>
      </div>
    );
  }

  return (
    <>
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex gap-2 md:gap-3 ${
            msg.role === "user" ? "justify-end" : "justify-start"
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
            {msg.role === "assistant" ? <ChatMarkdown content={msg.content} /> : msg.content}
          </div>

          {msg.role === "user" && (
            <div className="flex h-7 w-7 md:h-8 md:w-8 shrink-0 items-center justify-center rounded-full bg-accent">
              <User className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </div>
          )}
        </div>
      ))}

      {streamingContent && (
        <div className="flex gap-2 md:gap-3 justify-start animate-in fade-in-0 duration-200">
          <div className="flex h-7 w-7 md:h-8 md:w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Bot className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
          </div>
          <div className="rounded-lg px-3 md:px-4 py-2.5 md:py-3 max-w-[85%] md:max-w-[80%] text-sm bg-muted overflow-hidden wrap-break-word">
            <ChatMarkdown content={streamingContent} />
            <span className="inline-block w-1.5 h-4 bg-primary/60 animate-pulse ml-0.5 align-text-bottom rounded-sm" />
          </div>
        </div>
      )}

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
  );
}
