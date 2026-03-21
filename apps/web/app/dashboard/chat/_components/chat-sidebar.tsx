"use client";

import {
  GitBranch,
  MessageSquare,
  PanelLeftClose,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChatRepository, ChatSession } from "./types";

type ChatSidebarProps = {
  sidebarOpen: boolean;
  selectedRepoId: string;
  repos: ChatRepository[];
  sessions: ChatSession[];
  sessionsLoading: boolean;
  activeSessionId: string | null;
  isCreatingSession: boolean;
  onCloseSidebar: () => void;
  onSelectRepo: (repoId: string) => void;
  onNewChat: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
};

function truncateTitle(title: string, maxWords = 5) {
  if (!title) return "New Chat";
  const words = title.trim().split(/\s+/);
  if (words.length <= maxWords) return title;
  return `${words.slice(0, maxWords).join(" ")}...`;
}

export function ChatSidebar({
  sidebarOpen,
  selectedRepoId,
  repos,
  sessions,
  sessionsLoading,
  activeSessionId,
  isCreatingSession,
  onCloseSidebar,
  onSelectRepo,
  onNewChat,
  onSelectSession,
  onDeleteSession,
}: ChatSidebarProps) {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const sessionToDelete = sessions.find((s) => s.id === pendingDeleteId);

  const handleConfirmDelete = () => {
    if (pendingDeleteId) {
      onDeleteSession(pendingDeleteId);
      setPendingDeleteId(null);
    }
  };

  return (
    <>
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
                onClick={onNewChat}
                disabled={repos.length === 0 || isCreatingSession}
                className="h-7 gap-1 text-xs"
              >
                <Plus className="h-3 w-3" />
                New
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 md:hidden"
                onClick={onCloseSidebar}
              >
                <PanelLeftClose className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <Select value={selectedRepoId} onValueChange={onSelectRepo}>
            <SelectTrigger className="w-full h-8 text-xs">
              <SelectValue placeholder="All repositories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All repositories</SelectItem>
              {repos.map((repo) => (
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
              sessions.map((session) => (
                <div
                  key={session.id}
                  className={`group flex items-center gap-2 rounded-lg px-2 py-2 cursor-pointer transition-colors text-xs ${
                    activeSessionId === session.id
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50"
                  }`}
                  onClick={() => onSelectSession(session.id)}
                >
                  <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="w-50 md:w-55">
                    <p className="truncate font-medium text-xs" title={session.title}>
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
                    className="rounded-md hover:cursor-pointer ml-auto"
                    aria-label="Delete chat session"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPendingDeleteId(session.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteId(null);
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chat Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                &quot;{truncateTitle(sessionToDelete?.title ?? "this chat")}&quot;
              </span>
              ? This action cannot be undone and all messages will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
