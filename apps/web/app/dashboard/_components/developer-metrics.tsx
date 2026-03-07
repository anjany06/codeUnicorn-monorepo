"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  User2,
  GitPullRequest,
  Zap,
  BarChart2,
  TrendingUp,
  TrendingDown,
  Minus,
  Star,
} from "lucide-react";
import type { DeveloperMetrics } from "@/lib/api";

interface Props {
  data: DeveloperMetrics | null;
  isLoading: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  security: "#ef4444",
  performance: "#f59e0b",
  style: "#3b82f6",
  correctness: "#10b981",
};
const CATEGORY_LABEL: Record<string, string> = {
  security: "Security",
  performance: "Performance",
  style: "Style",
  correctness: "Correctness",
};

interface StatChipProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: React.ReactNode;
  accent?: string;
}

function StatChip({
  icon: Icon,
  label,
  value,
  sub,
  accent = "text-foreground",
}: StatChipProps) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl border border-border/40 bg-muted/30 hover:bg-muted/50 transition-colors">
      <div className="mt-0.5 shrink-0 h-9 w-9 rounded-lg bg-background/60 border border-border/40 flex items-center justify-center">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p
          className={`text-2xl font-bold leading-tight tabular-nums ${accent}`}
        >
          {value}
        </p>
        {sub && <div className="mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

function PRDelta({ current, previous }: { current: number; previous: number }) {
  if (previous === 0) return null;
  const delta = current - previous;
  if (delta === 0)
    return (
      <span className="text-xs text-muted-foreground flex items-center gap-0.5">
        <Minus className="h-3 w-3" /> No change
      </span>
    );
  const up = delta > 0;
  return (
    <span
      className={`text-xs flex items-center gap-0.5 ${up ? "text-emerald-500" : "text-red-500"}`}
    >
      {up ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      {up ? "+" : ""}
      {delta} vs last month
    </span>
  );
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="rounded-lg border border-border/60 bg-background/95 px-3 py-2 shadow-xl text-xs">
      <span className="font-semibold">
        {CATEGORY_LABEL[d.payload.category] ?? d.payload.category}
      </span>
      <span className="ml-2 text-muted-foreground">
        {d.value} finding{d.value !== 1 ? "s" : ""}
      </span>
    </div>
  );
};

export function DeveloperMetrics({ data, isLoading }: Props) {
  const chartData = (data?.topIssueCategories ?? []).map((c) => ({
    ...c,
    fill: CATEGORY_COLORS[c.category] ?? "#8b5cf6",
  }));

  return (
    <Card className="border-border/50 bg-linear-to-br from-card to-card/50 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <User2 className="h-4 w-4 text-violet-500" />
              Developer Insights
            </CardTitle>
            <CardDescription>
              Your coding activity and AI review patterns — last 30 days
            </CardDescription>
          </div>
          {data?.githubLogin && (
            <Badge variant="outline" className="gap-1.5 self-start shrink-0">
              <img
                src={data.avatarUrl}
                alt={data.githubLogin}
                className="h-4 w-4 rounded-full"
              />
              {data.githubLogin}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-48 rounded-xl" />
          </div>
        ) : !data ? (
          <div className="h-48 flex flex-col items-center justify-center text-center text-muted-foreground gap-3">
            <User2 className="h-10 w-10 opacity-20" />
            <p className="text-sm">No developer data available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: stat chips */}
            <div className="grid grid-cols-2 gap-3">
              <StatChip
                icon={GitPullRequest}
                label="PRs This Month"
                value={data.prsThisMonth}
                accent="text-violet-500"
                sub={
                  <PRDelta
                    current={data.prsThisMonth}
                    previous={data.prsLastMonth}
                  />
                }
              />
              <StatChip
                icon={Zap}
                label="Reviews Triggered"
                value={data.reviewsTriggered}
                accent="text-amber-500"
                sub={
                  <span className="text-xs text-muted-foreground">
                    Last 30 days
                  </span>
                }
              />
              <StatChip
                icon={BarChart2}
                label="Avg Issues/Review"
                value={data.avgIssuesPerReview}
                accent={
                  data.avgIssuesPerReview > 5
                    ? "text-red-500"
                    : data.avgIssuesPerReview > 2
                      ? "text-amber-500"
                      : "text-emerald-500"
                }
                sub={
                  <span className="text-xs text-muted-foreground">
                    {data.avgIssuesPerReview === 0
                      ? "Clean reviews!"
                      : data.avgIssuesPerReview > 5
                        ? "High — focus needed"
                        : "Looking good"}
                  </span>
                }
              />
              <StatChip
                icon={Star}
                label="All‑Time Reviews"
                value={data.totalReviewsAllTime}
                accent="text-blue-500"
                sub={
                  data.mostActiveRepo ? (
                    <span className="text-xs text-muted-foreground truncate block">
                      Top: {data.mostActiveRepo}
                    </span>
                  ) : undefined
                }
              />
            </div>

            {/* Right: horizontal bar chart of top issue categories */}
            <div className="flex flex-col">
              <p className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" />
                Top Issue Categories (30 days)
              </p>
              {chartData.every((d) => d.count === 0) ? (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-2">
                  <span className="text-4xl">🎉</span>
                  <p className="text-sm">
                    No issues found — great code quality!
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={170}>
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 0, right: 12, left: 0, bottom: 0 }}
                    barCategoryGap="28%"
                  >
                    <defs>
                      {chartData.map((d) => (
                        <linearGradient
                          key={d.category}
                          id={`dm-${d.category}`}
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="0"
                        >
                          <stop
                            offset="0%"
                            stopColor={d.fill}
                            stopOpacity={0.9}
                          />
                          <stop
                            offset="100%"
                            stopColor={d.fill}
                            stopOpacity={0.5}
                          />
                        </linearGradient>
                      ))}
                    </defs>
                    <XAxis
                      type="number"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "currentColor", fontSize: 11 }}
                      className="text-muted-foreground"
                      allowDecimals={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="category"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "currentColor", fontSize: 11 }}
                      className="text-muted-foreground"
                      width={82}
                      tickFormatter={(v) => CATEGORY_LABEL[v] ?? v}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }}
                    />
                    <Bar
                      dataKey="count"
                      radius={[0, 4, 4, 0]}
                      maxBarSize={20}
                      animationDuration={900}
                    >
                      {chartData.map((entry) => (
                        <Cell
                          key={entry.category}
                          fill={`url(#dm-${entry.category})`}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
              {data.mostActiveRepo && (
                <>
                  <Separator className="my-3" />
                  <p className="text-xs text-muted-foreground">
                    Most active repo:{" "}
                    <span className="font-semibold text-foreground">
                      {data.mostActiveRepo}
                    </span>
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
