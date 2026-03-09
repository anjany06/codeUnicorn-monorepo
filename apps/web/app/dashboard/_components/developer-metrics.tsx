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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  type LucideIcon,
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

/* ── Delta helpers ── */
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
      className={`text-xs flex items-center gap-0.5 ${up ? "text-emerald-500" : "text-red-400"}`}
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
      className={`text-xs flex items-center gap-0.5 ${up ? "text-emerald-500" : "text-red-400"}`}
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

/* ── Stat card ── */
interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub?: React.ReactNode;
}

function StatCard({ icon: Icon, label, value, sub }: StatCardProps) {
  return (
    <div
      className="flex items-start gap-3 p-4 rounded-xl border border-border/40 bg-card relative overflow-hidden transition-shadow hover:shadow-lg"
      style={{
        background:
          "linear-gradient(145deg, hsl(var(--card)) 0%, hsl(var(--muted)/0.4) 100%)",
        boxShadow:
          "0 1px 0 0 rgba(255,255,255,0.06) inset, 0 4px 16px -4px rgba(0,0,0,0.25), 0 1px 3px rgba(0,0,0,0.12)",
      }}
    >
      {/* top-edge highlight */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 40%, rgba(255,255,255,0.12) 60%, transparent 100%)",
        }}
      />
      <div
        className="shrink-0 h-8 w-8 rounded-md flex items-center justify-center"
        style={{
          background:
            "linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--card)) 100%)",
          boxShadow:
            "0 1px 0 rgba(255,255,255,0.08) inset, 0 2px 4px rgba(0,0,0,0.15)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground leading-none mb-1">
          {label}
        </p>
        <p className="text-xl font-semibold text-foreground tabular-nums leading-tight">
          {value}
        </p>
        {sub && <div className="mt-1">{sub}</div>}
      </div>
    </div>
  );
}

/* ── Tooltips ── */
const IssueTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <span className="font-medium text-foreground">
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
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-foreground mb-0.5">{label}</p>
      <span className="text-muted-foreground">{payload[0].value} commits</span>
    </div>
  );
};

const PRTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-foreground mb-0.5">{label}</p>
      <span className="text-muted-foreground">{payload[0].value} PRs</span>
    </div>
  );
};

const WeekdayTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-foreground mb-0.5">{label}</p>
      <span className="text-muted-foreground">{payload[0].value} commits</span>
    </div>
  );
};

/* ── Main component ── */
export function DeveloperMetrics({ data, isLoading }: Props) {
  const issueChartData = (data?.topIssueCategories ?? []).map((c) => ({
    ...c,
    fill: CATEGORY_COLORS[c.category] ?? "#8b5cf6",
  }));

  const maxMonthlyCommits = data?.monthlyCommits
    ? Math.max(...data.monthlyCommits.map((m) => m.commits), 1)
    : 1;

  return (
    <Card className="border-border/50 bg-linear-to-br from-card to-card/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <User2 className="h-4 w-4 text-muted-foreground" />
            Developer Insights
          </CardTitle>
          {data?.githubLogin && (
            <Badge variant="outline" className="gap-1.5 shrink-0 text-xs">
              <img
                src={data.avatarUrl}
                alt={data.githubLogin}
                className="h-3.5 w-3.5 rounded-full"
              />
              {data.githubLogin}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-44 rounded-lg" />
            <Skeleton className="h-40 rounded-lg" />
          </div>
        ) : !data ? (
          <div className="h-44 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <User2 className="h-8 w-8 opacity-20" />
            <p className="text-sm">No developer data available</p>
          </div>
        ) : (
          <>
            {/* Stat grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <StatCard
                icon={GitCommit}
                label="Commits this month"
                value={data.commitsThisMonth}
                sub={
                  <CommitDelta
                    current={data.commitsThisMonth}
                    previous={data.commitsLastMonth}
                  />
                }
              />
              <StatCard
                icon={GitPullRequest}
                label="PRs this month"
                value={data.prsThisMonth}
                sub={
                  <PRDelta
                    current={data.prsThisMonth}
                    previous={data.prsLastMonth}
                  />
                }
              />
              <StatCard
                icon={Zap}
                label="AI reviews (30d)"
                value={data.reviewsTriggered}
                sub={
                  <span className="text-xs text-muted-foreground">
                    Avg {data.avgIssuesPerReview} issues / review
                  </span>
                }
              />
              <StatCard
                icon={Flame}
                label="Current streak"
                value={`${data.currentStreak}d`}
                sub={
                  <span className="text-xs text-muted-foreground">
                    Best: {data.longestStreak} days
                  </span>
                }
              />
              <StatCard
                icon={CalendarDays}
                label="Most active month"
                value={data.mostActiveMonth ?? "--"}
                sub={
                  data.mostActiveMonthCount > 0 ? (
                    <span className="text-xs text-muted-foreground">
                      {data.mostActiveMonthCount} commits
                    </span>
                  ) : undefined
                }
              />
              <StatCard
                icon={Trophy}
                label="All-time reviews"
                value={data.totalReviewsAllTime}
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

            {/* Monthly activity — Commits / PRs tab */}
            <div>
              <Tabs defaultValue="commits">
                <div className="flex items-center justify-between mb-3">
                  <TabsList className="h-7 bg-muted/50">
                    <TabsTrigger
                      value="commits"
                      className="text-xs h-5 px-2 gap-1"
                    >
                      <GitCommit className="h-3 w-3" />
                      Commits
                    </TabsTrigger>
                    <TabsTrigger value="prs" className="text-xs h-5 px-2 gap-1">
                      <GitPullRequest className="h-3 w-3" />
                      PRs
                    </TabsTrigger>
                  </TabsList>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <GitCommit className="h-3.5 w-3.5" />
                    Last 12 months
                  </p>
                </div>

                <TabsContent value="commits" className="mt-0">
                  {data.monthlyCommits?.every((m) => m.commits === 0) ? (
                    <div className="h-28 flex items-center justify-center text-muted-foreground text-sm">
                      No commit data for the last 12 months
                    </div>
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height={150}>
                        <BarChart
                          data={data.monthlyCommits ?? []}
                          margin={{ top: 4, right: 4, left: -28, bottom: 0 }}
                          barCategoryGap="18%"
                        >
                          <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "currentColor", fontSize: 10 }}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "currentColor", fontSize: 10 }}
                            allowDecimals={false}
                          />
                          <Tooltip
                            content={<CommitTooltip />}
                            cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
                          />
                          <Bar
                            dataKey="commits"
                            radius={[3, 3, 0, 0]}
                            maxBarSize={32}
                            animationDuration={800}
                          >
                            {(data.monthlyCommits ?? []).map((entry, index) => (
                              <Cell
                                key={index}
                                fill={
                                  entry.commits === maxMonthlyCommits &&
                                  entry.commits > 0
                                    ? "#f59e0b"
                                    : "#10b981"
                                }
                                opacity={
                                  entry.commits === maxMonthlyCommits &&
                                  entry.commits > 0
                                    ? 1
                                    : 0.6
                                }
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                      {data.mostActiveMonth && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Peak month:{" "}
                          <span className="font-medium text-foreground">
                            {data.mostActiveMonth} ({data.mostActiveMonthCount}{" "}
                            commits)
                          </span>
                        </p>
                      )}
                    </>
                  )}
                </TabsContent>

                <TabsContent value="prs" className="mt-0">
                  {data.monthlyPRs?.every((m) => m.prs === 0) ? (
                    <div className="h-28 flex items-center justify-center text-muted-foreground text-sm">
                      No PR data for the last 12 months
                    </div>
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height={150}>
                        <BarChart
                          data={data.monthlyPRs ?? []}
                          margin={{ top: 4, right: 4, left: -28, bottom: 0 }}
                          barCategoryGap="18%"
                        >
                          <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "currentColor", fontSize: 10 }}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "currentColor", fontSize: 10 }}
                            allowDecimals={false}
                          />
                          <Tooltip
                            content={<PRTooltip />}
                            cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
                          />
                          <Bar
                            dataKey="prs"
                            radius={[3, 3, 0, 0]}
                            maxBarSize={32}
                            animationDuration={800}
                          >
                            {(data.monthlyPRs ?? []).map((entry, index) => {
                              const maxPRs = Math.max(
                                ...(data.monthlyPRs ?? []).map((m) => m.prs),
                                1,
                              );
                              return (
                                <Cell
                                  key={index}
                                  fill={
                                    entry.prs === maxPRs && entry.prs > 0
                                      ? "#f59e0b"
                                      : "#3b82f6"
                                  }
                                  opacity={
                                    entry.prs === maxPRs && entry.prs > 0
                                      ? 1
                                      : 0.6
                                  }
                                />
                              );
                            })}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                      {(() => {
                        const maxPRs = Math.max(
                          ...(data.monthlyPRs ?? []).map((m) => m.prs),
                          0,
                        );
                        const peakEntry = data.monthlyPRs?.find(
                          (m) => m.prs === maxPRs && m.prs > 0,
                        );
                        return peakEntry ? (
                          <p className="text-xs text-muted-foreground mt-2">
                            Peak month:{" "}
                            <span className="font-medium text-foreground">
                              {peakEntry.month} {peakEntry.year} (
                              {peakEntry.prs} PRs)
                            </span>
                          </p>
                        ) : null;
                      })()}
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            <Separator />

            {/* Tabs */}
            <Tabs defaultValue="issues">
              <TabsList className="h-8 bg-muted/50">
                <TabsTrigger value="issues" className="text-xs h-6">
                  <BarChart2 className="h-3 w-3 mr-1" />
                  Issue Categories
                </TabsTrigger>
                <TabsTrigger value="weekday" className="text-xs h-6">
                  <Star className="h-3 w-3 mr-1" />
                  Weekday Activity
                </TabsTrigger>
              </TabsList>

              <TabsContent value="issues" className="mt-4">
                {issueChartData.every((d) => d.count === 0) ? (
                  <div className="h-28 flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <p className="text-sm">
                      No issues found — great code quality!
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart
                      data={issueChartData}
                      layout="vertical"
                      margin={{ top: 0, right: 12, left: 0, bottom: 0 }}
                      barCategoryGap="28%"
                    >
                      <XAxis
                        type="number"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "currentColor",
                          fontSize: 11,
                        }}
                        allowDecimals={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="category"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "currentColor",
                          fontSize: 11,
                        }}
                        width={82}
                        tickFormatter={(v) => CATEGORY_LABEL[v] ?? v}
                      />
                      <Tooltip
                        content={<IssueTooltip />}
                        cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
                      />
                      <Bar
                        dataKey="count"
                        radius={[0, 3, 3, 0]}
                        maxBarSize={18}
                        animationDuration={800}
                      >
                        {issueChartData.map((entry) => (
                          <Cell
                            key={entry.category}
                            fill={entry.fill}
                            opacity={0.8}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
                {data.mostActiveRepo && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Most active repo:{" "}
                    <span className="font-medium text-foreground">
                      {data.mostActiveRepo}
                    </span>
                  </p>
                )}
              </TabsContent>

              <TabsContent value="weekday" className="mt-4">
                {data.weekdayActivity?.every((d) => d.commits === 0) ? (
                  <div className="h-28 flex items-center justify-center text-muted-foreground text-sm">
                    No weekday data available yet
                  </div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={150}>
                      <BarChart
                        data={data.weekdayActivity ?? []}
                        margin={{ top: 4, right: 4, left: -28, bottom: 0 }}
                        barCategoryGap="20%"
                      >
                        <XAxis
                          dataKey="day"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fill: "currentColor",
                            fontSize: 11,
                          }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fill: "currentColor",
                            fontSize: 10,
                          }}
                          allowDecimals={false}
                        />
                        <Tooltip
                          content={<WeekdayTooltip />}
                          cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
                        />
                        <Bar
                          dataKey="commits"
                          fill="#8b5cf6"
                          opacity={0.7}
                          radius={[3, 3, 0, 0]}
                          maxBarSize={32}
                          animationDuration={800}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                    {data.mostActiveDay && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Most productive day:{" "}
                        <span className="font-medium text-foreground">
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
