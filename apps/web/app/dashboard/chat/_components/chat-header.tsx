import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

type ChatHeaderProps = {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
};

export function ChatHeader({ sidebarOpen, onToggleSidebar }: ChatHeaderProps) {
  return (
    <div className="shrink-0 mb-3 flex items-center gap-3">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden h-8 w-8"
        onClick={onToggleSidebar}
      >
        {sidebarOpen ? (
          <PanelLeftClose className="h-4 w-4" />
        ) : (
          <PanelLeftOpen className="h-4 w-4" />
        )}
      </Button>
      <div>
        <h1 className="text-2xl font-heading font-semibold">AI Codebase Chat</h1>
        <p className="text-md text-muted-foreground hidden sm:block">
          Chat with AI about your codebase using context-aware RAG
        </p>
      </div>
    </div>
  );
}
