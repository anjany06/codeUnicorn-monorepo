"use client";

import React, { useMemo, useState, useCallback, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  GitCommit,
  Palette,
  Code2,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import type { ContributionDay, ContributionData } from "@/lib/api";

// ─── Color Themes ────────────────────────────────────────────────────────────

export interface HeatmapTheme {
  id: string;
  name: string;
  emoji: string;
  /** [empty, level1, level2, level3, level4] */
  light: [string, string, string, string, string];
  dark: [string, string, string, string, string];
  accent: string;
}

export const THEMES: HeatmapTheme[] = [
  {
    id: "github",
    name: "GitHub",
    emoji: "🟢",
    light: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
    dark: ["#2d333b", "#0e4429", "#006d32", "#26a641", "#39d353"],
    accent: "#30a14e",
  },
  {
    id: "ocean",
    name: "Ocean",
    emoji: "🌊",
    light: ["#ebedf0", "#b3d9ff", "#66b3ff", "#3399ff", "#0066cc"],
    dark: ["#2d333b", "#0f3460", "#1a5fb4", "#3399ff", "#66c2ff"],
    accent: "#3399ff",
  },
  {
    id: "sunset",
    name: "Sunset",
    emoji: "🌅",
    light: ["#ebedf0", "#fdd0a2", "#fdae6b", "#fd8d3c", "#e6550d"],
    dark: ["#2d333b", "#5c3000", "#8b4d13", "#d4721a", "#fd8d3c"],
    accent: "#fd8d3c",
  },
  {
    id: "purple",
    name: "Purple Rain",
    emoji: "💜",
    light: ["#ebedf0", "#d5b3ff", "#b366ff", "#9933ff", "#6600cc"],
    dark: ["#2d333b", "#2e1065", "#5b21b6", "#8b5cf6", "#c084fc"],
    accent: "#9933ff",
  },
  {
    id: "rose",
    name: "Rose",
    emoji: "🌹",
    light: ["#ebedf0", "#ffc0cb", "#ff85a1", "#ff4d6d", "#c9184a"],
    dark: ["#2d333b", "#881337", "#BF0D3F", "#e11d48", "#fb7185"],
    accent: "#ff4d6d",
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    emoji: "⚡",
    light: ["#ebedf0", "#ccffee", "#66ffcc", "#00e68a", "#00cc7a"],
    dark: ["#2d333b", "#006141", "#00805a", "#00cc8e", "#00ffb3"],
    accent: "#00ff99",
  },
  {
    id: "aurora",
    name: "Aurora",
    emoji: "🌌",
    light: ["#ebedf0", "#a5f3fc", "#67e8f9", "#06b6d4", "#0891b2"],
    dark: ["#2d333b", "#083344", "#155e75", "#0891b2", "#22d3ee"],
    accent: "#06b6d4",
  },
  {
    id: "cherry",
    name: "Cherry",
    emoji: "🍒",
    light: ["#ebedf0", "#fda4af", "#fb7185", "#e11d48", "#9f1239"],
    dark: ["#2d333b", "#4c0519", "#9f1239", "#e11d48", "#fb7185"],
    accent: "#e11d48",
  },
  {
    id: "golden",
    name: "Golden",
    emoji: "✨",
    light: ["#ebedf0", "#fde68a", "#fbbf24", "#f59e0b", "#d97706"],
    dark: ["#2d333b", "#451a03", "#92400e", "#d97706", "#fbbf24"],
    accent: "#f59e0b",
  },
  {
    id: "mint",
    name: "Mint",
    emoji: "🍃",
    light: ["#ebedf0", "#a7f3d0", "#6ee7b7", "#34d399", "#059669"],
    dark: ["#2d333b", "#064e3b", "#047857", "#10b981", "#6ee7b7"],
    accent: "#10b981",
  },
  {
    id: "lavender",
    name: "Lavender",
    emoji: "💎",
    light: ["#ebedf0", "#e0c3fc", "#c084fc", "#a855f7", "#7e22ce"],
    dark: ["#2d333b", "#3b0764", "#6b21a8", "#a855f7", "#d8b4fe"],
    accent: "#a855f7",
  },
  {
    id: "coral",
    name: "Coral",
    emoji: "🔥",
    light: ["#ebedf0", "#fed7aa", "#fdba74", "#f97316", "#c2410c"],
    dark: ["#2d333b", "#431407", "#9a3412", "#ea580c", "#fb923c"],
    accent: "#f97316",
  },
  {
    id: "ice",
    name: "Ice",
    emoji: "❄️",
    light: ["#ebedf0", "#d1ecf9", "#a3d5f7", "#5bb8f5", "#1d8cd7"],
    dark: ["#2d333b", "#0c2d48", "#14466a", "#2980b9", "#5dade2"],
    accent: "#2980b9",
  },
  {
    id: "forest",
    name: "Forest",
    emoji: "🌲",
    light: ["#ebedf0", "#b5e2b0", "#7bc47a", "#3a9d3a", "#1a6b1a"],
    dark: ["#2d333b", "#0D4A0D", "#1a6b1a", "#2e9e2e", "#5ccf5c"],
    accent: "#2e9e2e",
  },
  {
    id: "neon",
    name: "Neon",
    emoji: "💡",
    light: ["#ebedf0", "#e0f7a0", "#c6f050", "#a3e635", "#65a30d"],
    dark: ["#2d333b", "#31400F", "#4d6615", "#84cc16", "#bef264"],
    accent: "#84cc16",
  },
  {
    id: "dracula",
    name: "Dracula",
    emoji: "🧛",
    light: ["#ebedf0", "#d9c6f0", "#bd93f9", "#9b59e0", "#6c3db8"],
    dark: ["#282a36", "#3a2a5c", "#6c3db8", "#bd93f9", "#e2c6ff"],
    accent: "#bd93f9",
  },
  {
    id: "peach",
    name: "Peach",
    emoji: "🍑",
    light: ["#ebedf0", "#ffe0cc", "#ffb899", "#ff8c66", "#e65c2e"],
    dark: ["#2d333b", "#66290B", "#7a3418", "#c75b30", "#ff8c66"],
    accent: "#ff8c66",
  },
  {
    id: "mono",
    name: "Mono",
    emoji: "⚫",
    light: ["#ebedf0", "#c6c6c6", "#999999", "#666666", "#333333"],
    dark: ["#23282E", "#3d444d", "#5a636e", "#8b949e", "#c9d1d9"],
    accent: "#8b949e",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Cell Component (div-based so tooltips work) ─────────────────────────────

function HeatmapCell({
  day,
  color,
  size,
}: {
  day: ContributionDay;
  color: string;
  size: number;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="rounded-[3px] cursor-crosshair transition-transform duration-150 hover:scale-[1.3] hover:z-10 hover:ring-1 hover:ring-white/30"
          style={{
            width: size,
            height: size,
            backgroundColor: color,
            outline: "1px solid rgba(128,128,128,0.06)",
          }}
        />
      </TooltipTrigger>
      <TooltipContent
        side="top"
        sideOffset={6}
        className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 px-3 py-2 shadow-xl text-xs z-50"
      >
        <span className="font-semibold text-zinc-900 dark:text-white">
          {day.count} contribution{day.count !== 1 ? "s" : ""}
        </span>{" "}
        on {formatDate(day.date)}
      </TooltipContent>
    </Tooltip>
  );
}

// ─── Theme Picker ────────────────────────────────────────────────────────────

function ThemePicker({
  currentTheme,
  onSelect,
}: {
  currentTheme: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {THEMES.map((t) => (
        <button
          key={t.id}
          onClick={() => onSelect(t.id)}
          className={`
            flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-all
            ${
              t.id === currentTheme
                ? "border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
                : "border-border/50 bg-card/50 text-muted-foreground hover:bg-muted/50 hover:border-border"
            }
          `}
        >
          <div className="flex gap-px">
            {t.dark.slice(1).map((c, i) => (
              <span
                key={i}
                className="h-2.5 w-2.5 rounded-xs"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <span>{t.name}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Portfolio Embed Dialog ─────────────────────────────────────────────────

function PortfolioDialog({
  userId,
  themeId,
}: {
  userId: string;
  themeId: string;
}) {
  const [copied, setCopied] = useState<"link" | "iframe" | "markdown" | null>(
    null,
  );
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const embedUrl = `${baseUrl}/embed/${userId}?theme=${themeId}`;

  const snippets = {
    link: embedUrl,
    iframe: `<iframe src="${embedUrl}" width="100%" height="200" style="border:none;border-radius:12px;" loading="lazy"></iframe>`,
    markdown: `[![Contribution Graph](${embedUrl})](${baseUrl}/dashboard)`,
  };

  const handleCopy = useCallback(
    (key: "link" | "iframe" | "markdown") => {
      navigator.clipboard.writeText(snippets[key]);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    },
    [snippets],
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-xs border-border/50 hover:border-primary/40"
        >
          <Code2 className="h-3.5 w-3.5" />
          Use in Portfolio
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            Embed Contribution Graph
          </DialogTitle>
          <DialogDescription>
            Copy one of the snippets below and paste it in your portfolio or
            README. The{" "}
            <strong>{THEMES.find((t) => t.id === themeId)?.name}</strong> theme
            will be applied.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {(
            [
              {
                key: "link" as const,
                label: "Direct Link",
                icon: ExternalLink,
              },
              { key: "iframe" as const, label: "HTML iframe", icon: Code2 },
              { key: "markdown" as const, label: "Markdown", icon: Code2 },
            ] as const
          ).map(({ key, label, icon: Icon }) => (
            <div key={key} className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Icon className="h-3 w-3" />
                {label}
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-lg bg-muted/50 border border-border/40 px-3 py-2 text-[11px] break-all select-all font-mono leading-relaxed max-h-20 overflow-auto">
                  {snippets[key]}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 h-8 w-8"
                  onClick={() => handleCopy(key)}
                >
                  {copied === key ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface ContributionGraphProps {
  data: ContributionData | null;
  isLoading: boolean;
  userId?: string;
}

export function ContributionGraph({
  data,
  isLoading,
  userId,
}: ContributionGraphProps) {
  const [themeId, setThemeId] = useState("github");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const theme = useMemo(
    () => THEMES.find((t) => t.id === themeId) ?? THEMES[0],
    [themeId],
  );

  const colors = theme.dark;

  // Month markers — derive from the first day of each week column
  const monthMarkers = useMemo(() => {
    if (!data?.weeks?.length) return [];
    const markers: { label: string; col: number }[] = [];
    let lastMonth = -1;
    data.weeks.forEach((week, i) => {
      if (!week.length) return;
      const m = new Date(week[0].date).getMonth();
      if (m !== lastMonth) {
        markers.push({ label: MONTH_LABELS[m], col: i });
        lastMonth = m;
      }
    });
    return markers;
  }, [data]);

  const cellSize = 13;
  const gap = 3;

  return (
    <Card className="border-border/50 bg-linear-to-br from-card to-card/50 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <GitCommit className="h-4 w-4" style={{ color: theme.accent }} />
              Contribution Graph
            </CardTitle>
            <CardDescription>
              {data ? (
                <>
                  <span className="font-semibold text-foreground">
                    {data.totalContributions.toLocaleString("en-US")}
                  </span>{" "}
                  contributions in the last year
                </>
              ) : (
                "Your GitHub activity heatmap"
              )}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {mounted && userId && (
              <PortfolioDialog userId={userId} themeId={themeId} />
            )}
          </div>
        </div>

        {/* Theme picker row */}
        <div className="pt-3">
          <div className="flex items-center gap-2 mb-2">
            <Palette className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">
              Color Theme
            </span>
          </div>
          <ThemePicker currentTheme={themeId} onSelect={setThemeId} />
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <TooltipProvider delayDuration={40}>
          {isLoading ? (
            <Skeleton className="h-[160px] w-full rounded-xl" />
          ) : !data?.weeks?.length ? (
            <div className="h-[160px] flex flex-col items-center justify-center text-center text-muted-foreground gap-3">
              <GitCommit className="h-10 w-10 opacity-20" />
              <p className="text-sm">No contribution data available</p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto pb-2">
              {/* Center wrapper */}
              <div className="flex justify-center">
                <div className="inline-block">
                  {/* Month labels row */}
                  <div className="flex" style={{ paddingLeft: 32 }}>
                    {data.weeks.map((week, wi) => {
                      const marker = monthMarkers.find((m) => m.col === wi);
                      return (
                        <div
                          key={wi}
                          style={{ width: cellSize + gap, flexShrink: 0 }}
                          className="text-[10px] text-muted-foreground"
                        >
                          {marker?.label ?? ""}
                        </div>
                      );
                    })}
                  </div>

                  {/* Grid: day labels + heatmap cells */}
                  <div className="flex gap-0">
                    {/* Day labels */}
                    <div
                      className="flex flex-col shrink-0 pr-1"
                      style={{ gap, width: 28 }}
                    >
                      {DAY_LABELS.map((label, i) => (
                        <div
                          key={i}
                          className="text-[9px] text-muted-foreground flex items-center justify-end"
                          style={{ height: cellSize }}
                        >
                          {i % 2 === 1 ? label : ""}
                        </div>
                      ))}
                    </div>

                    {/* Heatmap columns */}
                    <div className="flex" style={{ gap }}>
                      {data.weeks.map((week, wi) => (
                        <div key={wi} className="flex flex-col" style={{ gap }}>
                          {week.map((day, di) => (
                            <HeatmapCell
                              key={di}
                              day={day}
                              color={colors[day.level]}
                              size={cellSize}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center justify-end gap-1.5 pt-3 pr-0.5">
                    <span className="text-[10px] text-muted-foreground mr-1">
                      Less
                    </span>
                    {colors.map((c, i) => (
                      <span
                        key={i}
                        className="h-[11px] w-[11px] rounded-xs"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                    <span className="text-[10px] text-muted-foreground ml-1">
                      More
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}

export default ContributionGraph;
