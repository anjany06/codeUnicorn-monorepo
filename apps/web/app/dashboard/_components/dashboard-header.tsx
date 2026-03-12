import { Badge } from "@/components/ui/badge";

export function DashboardHeader() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold font-heading tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
          Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">
          Track your coding journey and AI-powered insights
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className="group relative overflow-hidden border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-emerald-100 shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_10px_28px_-14px_rgba(16,185,129,0.5)] backdrop-blur-md"
        >
          <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-18deg] bg-gradient-to-r from-transparent via-emerald-300/30 to-transparent animate-live-sync-shimmer" />
          <span className="relative mr-1.5 flex h-2.5 w-2.5 items-center justify-center">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400/70 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
          </span>
          <span className="relative text-xs font-semibold tracking-[0.04em]">
            Live Sync
          </span>
        </Badge>
      </div>
    </div>
  );
}
