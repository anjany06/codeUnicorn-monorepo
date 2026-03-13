"use client";

import { Bot, Plus } from "lucide-react";
import { ConnectButton } from "../../repository/_components/connect-button";

type ChatEmptyStateProps = {
  isCreatingSession: boolean;
  hasConnectedRepos: boolean;
  onNewChat: () => void;
};

export function ChatEmptyState({
  isCreatingSession,
  hasConnectedRepos,
  onNewChat,
}: ChatEmptyStateProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-primary/10">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/25 bg-linear-to-b from-primary/30 via-primary/18 to-primary/8 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-8px_14px_rgba(0,0,0,0.18),0_14px_24px_-16px_rgba(16,185,129,0.55)] md:h-16 md:w-16">
            <span className="pointer-events-none absolute left-2 top-1.5 h-2.5 w-6 rounded-full bg-white/25 blur-[1px]" />
            <Bot className="h-7 w-7 text-primary drop-shadow-[0_2px_1px_rgba(0,0,0,0.25)] md:h-8 md:w-8" />
          </div>
        </div>
        <div>
          <h3 className="text-base md:text-lg font-semibold">
            Ask anything about your code
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground mt-1 max-w-md">
            Select a chat session or start a new one. The AI uses your indexed
            codebase for context-aware answers.
          </p>
        </div>
        <ConnectButton
          onClick={onNewChat}
          isConnected={false}
          isLoading={isCreatingSession}
          disabled={!hasConnectedRepos}
          idleLabel="Start a conversation"
          loadingLabel="Starting..."
          idleIcon={<Plus className="h-3.5 w-3.5" />}
        />
      </div>
    </div>
  );
}
