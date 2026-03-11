"use client";

import React from "react";
import { Loader2, Plug, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ConnectButtonProps = {
  isConnected: boolean;
  isLoading: boolean;
  onClick: () => void;
};

export function ConnectButton({
  isConnected,
  isLoading,
  onClick,
}: ConnectButtonProps) {
  return (
    <Button
      size="sm"
      onClick={onClick}
      disabled={isLoading || isConnected}
      className={cn(
        "relative h-9 overflow-hidden border px-3.5 text-xs font-semibold tracking-[0.03em] transition-all duration-300",
        isConnected
          ? "border-emerald-300/25 bg-emerald-500/12 text-emerald-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_10px_20px_-16px_rgba(16,185,129,0.65)]"
          : "border-emerald-300/35 bg-linear-to-b from-emerald-300/40 via-emerald-400/25 to-emerald-500/18 text-emerald-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.5),inset_0_-1px_0_rgba(0,0,0,0.15),0_14px_26px_-16px_rgba(16,185,129,0.9)] hover:brightness-110 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.6),inset_0_-1px_0_rgba(0,0,0,0.15),0_18px_30px_-14px_rgba(16,185,129,0.95)]"
      )}
    >
      {!isConnected && !isLoading && (
        <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-16deg] bg-gradient-to-r from-transparent via-white/35 to-transparent animate-live-sync-shimmer" />
      )}
      <span className="relative inline-flex items-center gap-1.5">
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : isConnected ? (
          <CheckCircle2 className="h-3.5 w-3.5" />
        ) : (
          <Plug className="h-3.5 w-3.5" />
        )}
        {isLoading ? "Connecting..." : isConnected ? "Connected" : "Connect"}
      </span>
    </Button>
  );
}

