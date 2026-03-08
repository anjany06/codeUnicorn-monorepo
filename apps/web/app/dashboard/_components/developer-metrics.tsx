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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User2,
  GitPullRequest,
  Zap,
  BarChart2,
  TrendingUp,
  TrendingDown,
  Minus,
  Star,
  Flame,
  GitCommit,
  CalendarDays,
  Trophy,
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

function CommitDelta({
  current,
  previous,
}: {
  current: number;
  previous: number;
}) {
  if (previous === 0 && current === 0) return null;
  if (previous === 0)
    return <span className="text-xs text-muted-foreground">New activity</span>;
  const delta = current - previous;
  if (delta === 0)
    return (
      <span className="text-xs text-muted-foreground flex items-center gap-0.5">
        <Minus className="h-3 w-3" /> No change vs last month
      </span>
    );
  const up = delta > 0;
  const pct = Math.abs(Math.round((delta / previous) * 100));
  return (
    <span
      className={`text-xs flex items-center gap-0.5 ${up ? "text-emerald-500" : "text-red-500"}`}
    >
      {up ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      {up ? "+" : "-"}
      {pct}% vs last month
    </span>
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

const IssueTooltip = ({ active, payload }: any) => {
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

const CommitTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border/60 bg-background/95 px-3 py-2 shadow-xl text-xs">
      <p className="font-semibold mb-1">{label}</p>
      <span className="text-muted-foreground">{payload[0].value} commits</span>
    </div>
  );
};

const WeekdayTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border/60 bg-background/95 px-3 py-2 shadow-xl text-xs">
      <p className="font-semibold mb-1">{label}</p>
      <span className="text-muted-foreground">{payload[0].value} commits</span>
    </div>
  );
};

export function DeveloperMetrics({ data, isLoading }: Props) {
  const issueChartData = (data?.topIssueCategories ?? []).map((c) => ({
    ...c,
    fill: CATEGORY_COLORS[c.category] ?? "#8b5cf6",
  }));

  // Highlight the most active month bar
  const maxMonthlyCommits = data?.monthlyCommits
    ? Math.max(...data.monthlyCommits.map((m) => m.commits), 1)
    : 1;

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
              Real GitHub activity â€” commits, PRs, streaks &amp; patterns
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

      <CardContent className="pt-4 space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
        ) : !data ? (
          <div className="h-48 flex flex-col items-center justify-center text-center text-muted-foreground gap-3">
            <User2 className="h-10 w-10 opacity-20" />
            <p className="text-sm">No developer data available</p>
          </div>
        ) : (
          <>
            {/* â”€â”€ 6-chip stat grid â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <StatChip
                icon={GitCommit}
                label="Commits This Month"
                value={data.commitsThisMonth}
                accent="text-emerald-500"
                sub={
                  <CommitDelta
                    current={data.commitsThisMonth}
                    previous={data.commitsLastMonth}
                  />
                }
              />
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
                label="AI Reviews (30d)"
                value={data.reviewsTriggered}
                accent="text-amber-500"
                sub={
                  <span className="text-xs text-muted-foreground">
                    Avg {data.avgIssuesPerReview} issues/review
                  </span>
                }
              />
              <StatChip
                icon={Flame}
                label="Current Streak"
                value={`${data.currentStreak}d`}
                accent={
                  data.currentStreak >= 7
                    ? "text-orange-500"
                    : "text-foreground"
                }
                sub={
                  <span className="text-xs text-muted-foreground">
                    Best: {data.longestStreak} days
                  </span>
                }
              />
              <StatChip
                icon={CalendarDays}
                label="Most Active Month"
                value={data.mostActiveMonth ?? "â€”"}
                accent="text-blue-500"
                sub={
                  data.mostActiveMonthCount > 0 ? (
                    <span className="text-xs text-muted-foreground">
                      {data.mostActiveMonthCount} commits
                    </span>
                  ) : undefined
                }
              />
              <StatChip
                icon={Trophy}
                label="All-Time Reviews"
                value={data.totalReviewsAllTime}
                accent="text-pink-500"
                sub={
                  data.mostActiveRepo ? (
                    <span className="text-xs text-muted-foreground truncate block">
                      Top: {data.mostActiveRepo}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      across all repos
                    </span>
                  )
                }
              />
            </div>

            {/* â”€â”€ Monthly commit activity (12 months) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
                <GitCommit className="h-3.5 w-3.5" />
                Commit Activity â€” Last 12 Months
                {data.mostActiveMonth && (
                  <Badge
                    variant="secondary"
                    className="ml-2 text-[10px] px-1.5 py-0 h-4"
                  >
                    Peak: {data.mostActiveMonth}
                  </Badge>
                )}
              </p>
              {data.monthlyCommits?.every((m) => m.commits === 0) ? (
                <div className="h-28 flex items-center justify-center text-muted-foreground text-sm">
                  No commit data for the last 12 months
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart
                    data={data.monthlyCommits ?? []}
                    margin={{ top: 4, right: 4, left: -28, bottom: 0 }}
                    barCategoryGap="18%"
                  >
                    <defs>
                      <linearGradient
                        id="dm-commits-normal"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#10b981"
                          stopOpacity={0.85}
                        />
                        <stop
                          offset="100%"
                          stopColor="#10b981"
                          stopOpacity={0.4}
                        />
                      </linearGradient>
                      <linearGradient
                        id="dm-commits-peak"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                        <stop
                          offset="100%"
                          stopColor="#f59e0b"
                          stopOpacity={0.6}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "currentColor", fontSize: 10 }}
                      className="text-muted-foreground"
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "currentColor", fontSize: 10 }}
                      className="text-muted-foreground"
                      allowDecimals={false}
                    />
                    <Tooltip
                      content={<CommitTooltip />}
                      cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }}
                    />
                    <Bar
                      dataKey="commits"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={36}
                      animationDuration={900}
                    >
                      {(data.monthlyCommits ?? []).map((entry, index) => (
                        <Cell
                          key={index}
                          fill={
                            entry.commits === maxMonthlyCommits &&
                            entry.commits > 0
                              ? "url(#dm-commits-peak)"
                              : "url(#dm-commits-normal)"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <Separator />

            {/* â”€â”€ Tabs: Issue categories | Weekday activity â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <Tabs defaultValue="issues">
              <TabsList className="mb-4 bg-muted/50 h-8">
                <TabsTrigger value="issues" className="text-xs h-6">
                  <BarChart2 className="h-3 w-3 mr-1" />
                  Issue Categories
                </TabsTrigger>
                <TabsTrigger value="weekday" className="text-xs h-6">
                  <Star className="h-3 w-3 mr-1" />
                  Weekday Activity
                </TabsTrigger>
              </TabsList>

              <TabsContent value="issues" className="mt-0">
                {issueChartData.every((d) => d.count === 0) ? (
                  <div className="h-28 flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <span className="text-3xl">ðŸŽ‰</span>
                    <p className="text-sm">
                      No issues found â€” great code quality!
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart
                      data={issueChartData}
                      layout="vertical"
                      margin={{ top: 0, right: 12, left: 0, bottom: 0 }}
                      barCategoryGap="28%"
                    >
                      <defs>
                        {issueChartData.map((d) => (
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
                        content={<IssueTooltip />}
                        cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }}
                      />
                      <Bar
                        dataKey="count"
                        radius={[0, 4, 4, 0]}
                        maxBarSize={20}
                        animationDuration={900}
                      >
                        {issueChartData.map((entry) => (
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
                  <p className="text-xs text-muted-foreground mt-2">
                    Most active repo:{" "}
                    <span className="font-semibold text-foreground">
                      {data.mostActiveRepo}
                    </span>
                  </p>
                )}
              </TabsContent>

              <TabsContent value="weekday" className="mt-0">
                {data.weekdayActivity?.every((d) => d.commits === 0) ? (
                  <div className="h-28 flex items-center justify-center text-muted-foreground text-sm">
                    No weekday data available yet
                  </div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart
                        data={data.weekdayActivity ?? []}
                        margin={{ top: 4, right: 4, left: -28, bottom: 0 }}
                        barCategoryGap="20%"
                      >
                        <defs>
                          <linearGradient
                            id="dm-weekday"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="#8b5cf6"
                              stopOpacity={0.9}
                            />
                            <stop
                              offset="100%"
                              stopColor="#8b5cf6"
                              stopOpacity={0.4}
                            />
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="day"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "currentColor", fontSize: 11 }}
                          className="text-muted-foreground"
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "currentColor", fontSize: 10 }}
                          className="text-muted-foreground"
                          allowDecimals={false}
                        />
                        <Tooltip
                          content={<WeekdayTooltip />}
                          cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }}
                        />
                        <Bar
                          dataKey="commits"
                          fill="url(#dm-weekday)"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={36}
                          animationDuration={900}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                    {data.mostActiveDay && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Most productive day:{" "}
                        <span className="font-semibold text-foreground">
                          {data.mostActiveDay}
                        </span>
                      </p>
                    )}
                  </>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  );
}
