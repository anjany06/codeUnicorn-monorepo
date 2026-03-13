"use client";

import React from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ChatInputProps = {
  messageInput: string;
  isStreaming: boolean;
  sendError: string | null;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onMessageChange: (value: string) => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
  onSend: () => void;
};

export function ChatInput({
  messageInput,
  isStreaming,
  sendError,
  textareaRef,
  onMessageChange,
  onKeyDown,
  onSend,
}: ChatInputProps) {
  return (
    <div className="shrink-0 border-t bg-background p-3 md:p-4">
      <div className="flex gap-2 max-w-3xl mx-auto items-end">
        <Textarea
          ref={textareaRef}
          value={messageInput}
          onChange={(e) => onMessageChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask about your codebase..."
          className="min-h-[44px] max-h-32 resize-none text-sm"
          disabled={isStreaming}
          rows={1}
        />
        <Button
          onClick={onSend}
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
        Enter to send | Shift+Enter for new line
      </p>
      {sendError && (
        <p className="mt-1.5 text-center text-[11px] text-destructive">{sendError}</p>
      )}
    </div>
  );
}
