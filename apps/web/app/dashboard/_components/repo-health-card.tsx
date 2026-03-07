"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  BookOpen,
  CheckCircle2,
  GitPullRequest,
  Settings2,
} from "lucide-react";
import type { RepoHealthScore } from "@/lib/api";

interface Props {
  data: RepoHealthScore[];
  isLoading: boolean;
}

function scoreColor(score: number): {
  text: string;
  ring: string;
  bg: string;
  stop1: string;
  stop2: string;
} {
  if (score >= 75)
    return {
      text: "text-emerald-500",
      ring: "#10b981",
      bg: "bg-emerald-500/10",
      stop1: "#10b981",
      stop2: "#34d399",
    };
  if (score >= 50)
    return {
      text: "text-amber-500",
      ring: "#f59e0b",
      bg: "bg-amber-500/10",
      stop1: "#f59e0b",
      stop2: "#fbbf24",
    };
  return {
    text: "text-red-500",
    ring: "#ef4444",
    bg: "bg-red-500/10",
    stop1: "#ef4444",
    stop2: "#f87171",
  };
}

function scoreLabel(score: number): string {
  if (score >= 75) return "Healthy";
  if (score >= 50) return "Fair";
  return "Needs Work";
}

interface GaugeProps {
  score: number;
  id: string;
}

function CircularGauge({ score, id }: GaugeProps) {
  const r = 36;
  const cx = 50;
  const cy = 50;
  const circumference = 2 * Math.PI * r;
  const filled = Math.max(0, Math.min(score, 100)) / 100;
  const dashOffset = circumference * (1 - filled);
  const col = scoreColor(score);

  return (
    <svg viewBox="0 0 100 100" className="w-24 h-24 -rotate-90" aria-hidden>
      <defs>
        <linearGradient
          id={`gauge-grad-${id}`}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop offset="0%" stopColor={col.stop1} />
          <stop offset="100%" stopColor={col.stop2} />
        </linearGradient>
      </defs>
      {/* Track */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="hsl(var(--muted))"
        strokeWidth={9}
      />
      {/* Progress arc */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={`url(#gauge-grad-${id})`}
        strokeWidth={9}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        style={{
          transition:
            "stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      />
    </svg>
  );
}

const PILLARS = [
  {
    key: "docCoverage",
    label: "Docs Coverage",
    icon: BookOpen,
    color: "bg-blue-500",
  },
  {
    key: "reviewFrequency",
    label: "Review Frequency",
    icon: GitPullRequest,
    color: "bg-violet-500",
  },
  {
    key: "reviewQuality",
    label: "Review Quality",
    icon: CheckCircle2,
    color: "bg-emerald-500",
  },
  {
    key: "configActive",
    label: "Config Active",
    icon: Settings2,
    color: "bg-amber-500",
  },
] as const;

function RepoHealthItem({ repo }: { repo: RepoHealthScore }) {
  const col = scoreColor(repo.healthScore);

  return (
    <Card className="border-border/40 bg-linear-to-br from-card to-card/60 hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-5">
        {/* Top row: gauge + name/badge */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative shrink-0">
            <CircularGauge score={repo.healthScore} id={repo.repoId} />
            {/* Score label inside gauge */}
            <div className="absolute inset-0 flex flex-col items-center justify-center rotate-90">
              <span className={`text-xl font-bold leading-none ${col.text}`}>
                {repo.healthScore}
              </span>
              <span className="text-[9px] text-muted-foreground mt-0.5">
                /100
              </span>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm truncate" title={repo.fullName}>
              {repo.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {repo.fullName}
            </p>
            <div className="mt-1.5 flex gap-1.5">
              <Badge
                variant="outline"
                className={`text-xs py-0 px-1.5 ${col.text}`}
                style={{ borderColor: col.ring + "40" }}
              >
                {scoreLabel(repo.healthScore)}
              </Badge>
              {repo.totalReviews > 0 && (
                <Badge variant="secondary" className="text-xs py-0 px-1.5">
                  {repo.totalReviews} review{repo.totalReviews !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Four pillar bars */}
        <div className="space-y-2.5">
          {PILLARS.map(({ key, label, icon: Icon, color }) => {
            const raw = repo[key];
            // configActive is boolean on the type but service sends 0/25
            const val =
              typeof raw === "boolean" ? (raw ? 25 : 0) : (raw as number);
            const pct = Math.round((val / 25) * 100);
            return (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Icon className="h-3 w-3" />
                    {label}
                  </span>
                  <span className="font-medium tabular-nums">
                    {val}
                    <span className="text-muted-foreground">/25</span>
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full ${color} transition-all duration-700`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function RepoHealthCard({ data, isLoading }: Props) {
  return (
    <Card className="border-border/50 bg-linear-to-br from-card to-card/50 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4 text-emerald-500" />
            Repository Health Scores
          </CardTitle>
          <CardDescription>
            4-pillar score per repo: docs · review frequency · review quality ·
            config
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-52 rounded-xl" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center text-muted-foreground gap-3">
            <Activity className="h-10 w-10 opacity-20" />
            <p className="text-sm">
              Connect a repository to see its health score
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((repo) => (
              <RepoHealthItem key={repo.repoId} repo={repo} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
