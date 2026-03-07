"use client";

import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ShieldAlert, Zap, Paintbrush, Bug } from "lucide-react";
import type { CodeQualityWeek } from "@/lib/api";

const CATEGORIES = [
  {
    key: "security" as const,
    label: "Security",
    color: "#ef4444",
    icon: ShieldAlert,
  },
  {
    key: "performance" as const,
    label: "Performance",
    color: "#f59e0b",
    icon: Zap,
  },
  { key: "style" as const, label: "Style", color: "#3b82f6", icon: Paintbrush },
  {
    key: "correctness" as const,
    label: "Correctness",
    color: "#10b981",
    icon: Bug,
  },
];

interface Props {
  data: CodeQualityWeek[];
  isLoading: boolean;
}

function BarGroup({
  week,
  maxValue,
}: {
  week: CodeQualityWeek;
  maxValue: number;
}) {
  const total =
    week.security + week.performance + week.style + week.correctness;

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0 group cursor-default">
            {/* Bars */}
            <div className="flex items-end gap-[3px] h-[200px] w-full justify-center">
              {CATEGORIES.map(({ key, color }) => {
                const val = week[key];
                const heightPct = maxValue > 0 ? (val / maxValue) * 100 : 0;
                return (
                  <div
                    key={key}
                    className="flex-1 max-w-[14px] rounded-t-sm transition-all duration-500 ease-out group-hover:brightness-110"
                    style={{
                      height: `${Math.max(heightPct, val > 0 ? 4 : 0)}%`,
                      backgroundColor: color,
                      opacity: val > 0 ? 0.85 : 0.12,
                    }}
                  />
                );
              })}
            </div>
            {/* Label */}
            <span className="text-[10px] text-muted-foreground truncate max-w-full text-center">
              {week.label}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="rounded-xl border border-border/60 bg-background/95 p-3 shadow-2xl backdrop-blur-md text-sm"
        >
          <p className="font-semibold mb-2 text-foreground">{week.label}</p>
          {CATEGORIES.map(({ key, label, color }) => (
            <div key={key} className="flex items-center gap-2 py-0.5">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="text-muted-foreground text-xs">{label}:</span>
              <span className="font-bold text-xs ml-auto pl-3">
                {week[key]}
              </span>
            </div>
          ))}
          <p className="mt-2 pt-2 border-t border-border/40 text-xs text-muted-foreground">
            {total} issue{total !== 1 ? "s" : ""} · {week.reviewCount} review
            {week.reviewCount !== 1 ? "s" : ""}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function CodeQualityTrends({ data, isLoading }: Props) {
  const hasData = data.some((w) => w.reviewCount > 0);

  const maxValue = useMemo(() => {
    if (!data.length) return 1;
    return Math.max(
      1,
      ...data.flatMap((w) => [
        w.security,
        w.performance,
        w.style,
        w.correctness,
      ]),
    );
  }, [data]);

  return (
    <Card className="border-border/50 bg-linear-to-br from-card to-card/50 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldAlert className="h-4 w-4 text-red-500" />
              Code Quality Trends
            </CardTitle>

            <CardDescription>
              Issue categories found per review — last 8 weeks
            </CardDescription>
          </div>

          {/* Legend pills */}
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map(({ key, label, color }) => (
              <Badge
                key={key}
                variant="outline"
                className="gap-1.5 text-xs py-0.5 px-2"
                style={{ borderColor: `${color}40`, color }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                {label}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-[280px] w-full rounded-xl" />
          </div>
        ) : !hasData ? (
          <div className="h-[280px] flex flex-col items-center justify-center text-center text-muted-foreground gap-3">
            <ShieldAlert className="h-10 w-10 opacity-20" />
            <p className="text-sm">
              No review data yet — trigger a PR review to see trends
            </p>
          </div>
        ) : (
          <div className="flex items-end gap-2 px-2" style={{ height: 240 }}>
            {/* Y-axis */}
            <div className="flex flex-col justify-between h-[200px] pr-1 shrink-0">
              {[maxValue, Math.round(maxValue / 2), 0].map((v) => (
                <span
                  key={v}
                  className="text-[10px] text-muted-foreground tabular-nums leading-none"
                >
                  {v}
                </span>
              ))}
            </div>
            {/* Bars */}
            <div className="flex-1 flex items-end gap-1">
              {data.map((week) => (
                <BarGroup key={week.label} week={week} maxValue={maxValue} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
