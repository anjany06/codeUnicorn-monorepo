"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  GitCommit,
  GitPullRequest,
  GitBranch,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  ArrowUpRight,
} from "lucide-react";
import React, { useMemo, useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import {
  getDashboardStats,
  getMonthlyActivity,
  getDeveloperMetrics,
  getContributionData,
} from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { IssueActivityFeed } from "./_components/issue-activity";
import { DeveloperMetrics } from "./_components/developer-metrics";

import { ContributionGraph } from "./_components/contribution-graph";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

// Custom 3D Bar Component
const Custom3DBar = (props: any) => {
  const { x, y, width, height, fill, index } = props;
  const depth = 8;
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimated(true), index * 100);
    return () => clearTimeout(timer);
  }, [index]);

  const animatedHeight = isAnimated ? height : 0;
  const animatedY = isAnimated ? y : y + height;

  // Parse the gradient URL to get base color
  const getBaseColor = (fillValue: string) => {
    if (fillValue.includes("Commits")) return "#10b981";
    if (fillValue.includes("PRs")) return "#3b82f6";
    if (fillValue.includes("Reviews")) return "#8b5cf6";
    return "#10b981";
  };

  const baseColor = fill.includes("url") ? getBaseColor(props.name) : fill;

  // Calculate darker shades for 3D effect
  const darkerShade = (color: string, amount: number) => {
    const hex = color.replace("#", "");
    const r = Math.max(0, parseInt(hex.slice(0, 2), 16) - amount);
    const g = Math.max(0, parseInt(hex.slice(2, 4), 16) - amount);
    const b = Math.max(0, parseInt(hex.slice(4, 6), 16) - amount);
    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <g
      style={{
        transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        transform: isAnimated ? "translateY(0)" : "translateY(20px)",
        opacity: isAnimated ? 1 : 0,
      }}
    >
      {/* Right side (3D depth) */}
      <path
        d={`
          M ${x + width} ${animatedY}
          L ${x + width + depth} ${animatedY - depth}
          L ${x + width + depth} ${animatedY + animatedHeight - depth}
          L ${x + width} ${animatedY + animatedHeight}
          Z
        `}
        fill={darkerShade(baseColor, 40)}
        style={{
          transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      />
      {/* Top face (3D depth) */}
      <path
        d={`
          M ${x} ${animatedY}
          L ${x + depth} ${animatedY - depth}
          L ${x + width + depth} ${animatedY - depth}
          L ${x + width} ${animatedY}
          Z
        `}
        fill={darkerShade(baseColor, 20)}
        style={{
          transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      />
      {/* Front face */}
      <rect
        x={x}
        y={animatedY}
        width={width}
        height={animatedHeight}
        fill={`url(#${fill.replace("url(#", "").replace(")", "")})`}
        rx={4}
        ry={4}
        style={{
          transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
          filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))",
        }}
      />
      {/* Glossy highlight */}
      <rect
        x={x + 2}
        y={animatedY + 2}
        width={width - 4}
        height={Math.min(animatedHeight * 0.3, 20)}
        fill="rgba(255, 255, 255, 0.2)"
        rx={3}
        ry={3}
        style={{
          transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      />
    </g>
  );
};

// Custom 3D Area with smooth line animation
const AnimatedAreaChart = ({
  data,
  isLoading,
}: {
  data: any[];
  isLoading: boolean;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (!isLoading && data?.length) {
      setAnimationKey((prev) => prev + 1);
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, data]);

  // Color map for tooltip
  const colorMap: Record<string, string> = {
    commits: "#10b981",
    prs: "#3b82f6",
    reviews: "#8b5cf6",
  };

  return (
    <div
      className="h-[350px] w-full"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible
          ? "translateY(0) scale(1)"
          : "translateY(20px) scale(0.95)",
        transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <style>
        {`
          @keyframes drawLine {
            from {
              stroke-dashoffset: 2000;
            }
            to {
              stroke-dashoffset: 0;
            }
          }
          
          @keyframes fadeInFill {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          
          .animated-line-commits {
            stroke-dasharray: 2000;
            stroke-dashoffset: 2000;
            animation: drawLine 2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }
          
          .animated-line-prs {
            stroke-dasharray: 2000;
            stroke-dashoffset: 2000;
            animation: drawLine 2s cubic-bezier(0.4, 0, 0.2, 1) 0.4s forwards;
          }
          
          .animated-line-reviews {
            stroke-dasharray: 2000;
            stroke-dashoffset: 2000;
            animation: drawLine 2s cubic-bezier(0.4, 0, 0.2, 1) 0.8s forwards;
          }
          
          .animated-fill-commits {
            opacity: 0;
            animation: fadeInFill 1s ease-out 1s forwards;
          }
          
          .animated-fill-prs {
            opacity: 0;
            animation: fadeInFill 1s ease-out 1.4s forwards;
          }
          
          .animated-fill-reviews {
            opacity: 0;
            animation: fadeInFill 1s ease-out 1.8s forwards;
          }
        `}
      </style>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          key={animationKey}
          data={data || []}
          margin={{ top: 20, right: 20, left: -10, bottom: 5 }}
        >
          <defs>
            {/* Gradient fills for areas */}
            <linearGradient
              id="areaCommitsAnimated"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="50%" stopColor="#10b981" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="areaPRsAnimated" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient
              id="areaReviewsAnimated"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>

            {/* Horizontal gradient for animated line strokes */}
            <linearGradient
              id="lineGradientGreen"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
              <stop offset="100%" stopColor="#34d399" stopOpacity={1} />
            </linearGradient>
            <linearGradient
              id="lineGradientBlue"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity={1} />
            </linearGradient>
            <linearGradient
              id="lineGradientPurple"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity={1} />
            </linearGradient>

            {/* Glow filters */}
            <filter
              id="glow-green"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-blue" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter
              id="glow-purple"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="hsl(var(--border))"
            opacity={0.3}
          />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "currentColor",
              fontSize: 12,
            }}
            dy={10}
            className="text-muted-foreground"
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "currentColor",
              fontSize: 12,
            }}
            dx={-10}
            className="text-muted-foreground"
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                // Filter out duplicate entries (we have line + fill for each)
                const uniquePayload = payload.filter(
                  (entry, index, self) =>
                    index ===
                    self.findIndex((e) => e.dataKey === entry.dataKey),
                );

                return (
                  <div className="rounded-xl border bg-background/5 p-4 shadow-2xl backdrop-blur-md">
                    <p className="font-bold text-lg mb-3 text-muted-foreground">
                      {label}
                    </p>
                    {uniquePayload.map((entry, index) => {
                      const color =
                        colorMap[entry.dataKey as string] || "#888888";
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-3 text-sm py-1"
                        >
                          <div
                            className="h-3 w-3 rounded-full shadow-lg"
                            style={{
                              backgroundColor: color,
                            }}
                          />
                          <span className="text-muted-foreground">
                            {entry.name}:
                          </span>
                          <span className="font-bold">{entry.value}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            verticalAlign="top"
            height={50}
            iconType="circle"
            iconSize={10}
            formatter={(value) => (
              <span className="text-sm font-medium text-muted-foreground">
                {value}
              </span>
            )}
            payload={[
              { value: "Commits", type: "circle", color: "#10b981" },
              { value: "Pull Requests", type: "circle", color: "#3b82f6" },
              { value: "AI Reviews", type: "circle", color: "#8b5cf6" },
            ]}
          />

          {/* Commits - Line with animation */}
          <Area
            type="monotone"
            dataKey="commits"
            name="Commits"
            stroke="url(#lineGradientGreen)"
            strokeWidth={3}
            fill="transparent"
            filter="url(#glow-green)"
            className="animated-line-commits"
            dot={false}
            activeDot={{
              r: 6,
              fill: "#10b981",
              stroke: "#fff",
              strokeWidth: 2,
              style: {
                filter: "drop-shadow(0 0 8px #10b981)",
              },
            }}
            legendType="none"
          />
          {/* Commits - Fill with delayed animation */}
          <Area
            type="monotone"
            dataKey="commits"
            stroke="transparent"
            strokeWidth={0}
            fill="url(#areaCommitsAnimated)"
            className="animated-fill-commits"
            dot={false}
            activeDot={false}
            legendType="none"
          />

          {/* PRs - Line with animation */}
          <Area
            type="monotone"
            dataKey="prs"
            name="Pull Requests"
            stroke="url(#lineGradientBlue)"
            strokeWidth={3}
            fill="transparent"
            filter="url(#glow-blue)"
            className="animated-line-prs"
            dot={false}
            activeDot={{
              r: 6,
              fill: "#3b82f6",
              stroke: "#fff",
              strokeWidth: 2,
              style: {
                filter: "drop-shadow(0 0 8px #3b82f6)",
              },
            }}
            legendType="none"
          />
          {/* PRs - Fill with delayed animation */}
          <Area
            type="monotone"
            dataKey="prs"
            stroke="transparent"
            strokeWidth={0}
            fill="url(#areaPRsAnimated)"
            className="animated-fill-prs"
            dot={false}
            activeDot={false}
            legendType="none"
          />

          {/* Reviews - Line with animation */}
          <Area
            type="monotone"
            dataKey="reviews"
            name="AI Reviews"
            stroke="url(#lineGradientPurple)"
            strokeWidth={3}
            fill="transparent"
            filter="url(#glow-purple)"
            className="animated-line-reviews"
            dot={false}
            activeDot={{
              r: 6,
              fill: "#8b5cf6",
              stroke: "#fff",
              strokeWidth: 2,
              style: {
                filter: "drop-shadow(0 0 8px #8b5cf6)",
              },
            }}
            legendType="none"
          />
          {/* Reviews - Fill with delayed animation */}
          <Area
            type="monotone"
            dataKey="reviews"
            stroke="transparent"
            strokeWidth={0}
            fill="url(#areaReviewsAnimated)"
            className="animated-fill-reviews"
            dot={false}
            activeDot={false}
            legendType="none"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const MainPage = () => {
  const { data: session } = useSession();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => await getDashboardStats(),
    refetchOnWindowFocus: false,
  });

  const { data: monthlyActivity, isLoading: isLoadingActivity } = useQuery({
    queryKey: ["monthly-activity"],
    queryFn: async () => await getMonthlyActivity(),
    refetchOnWindowFocus: false,
  });

  const {
    data: developerMetrics = null,
    isLoading: isLoadingDeveloperMetrics,
  } = useQuery({
    queryKey: ["developer-metrics"],
    queryFn: getDeveloperMetrics,
    refetchOnWindowFocus: false,
  });

  const { data: contributionData = null, isLoading: isLoadingContributions } =
    useQuery({
      queryKey: ["contribution-graph"],
      queryFn: getContributionData,
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    });

  // Real month-over-month changes derived from developer metrics
  const commitsDelta = useMemo(() => {
    const cur = developerMetrics?.commitsThisMonth ?? 0;
    const prev = developerMetrics?.commitsLastMonth ?? 0;
    if (prev === 0) return null;
    const pct = Math.round(((cur - prev) / prev) * 100);
    return { pct, up: pct >= 0 };
  }, [developerMetrics]);

  const prsDelta = useMemo(() => {
    const cur = developerMetrics?.prsThisMonth ?? 0;
    const prev = developerMetrics?.prsLastMonth ?? 0;
    if (prev === 0) return null;
    const pct = Math.round(((cur - prev) / prev) * 100);
    return { pct, up: pct >= 0 };
  }, [developerMetrics]);

  const [barChartKey, setBarChartKey] = useState(0);
  const [areaChartKey, setAreaChartKey] = useState(0);

  // Reset animation when tab changes
  const handleTabChange = (value: string) => {
    if (value === "bar") {
      setBarChartKey((prev) => prev + 1);
    } else if (value === "area") {
      setAreaChartKey((prev) => prev + 1);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Track your coding journey and AI-powered insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 py-1.5 px-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live Sync
          </Badge>
        </div>
      </div>

      {/* Stats Grid - Modern Glass Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Repositories Card */}
        <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-xl group hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-all duration-300" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Repositories
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <GitBranch className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">
                {isLoading ? "..." : stats?.totalRepos || 0}
              </span>
              <Badge
                variant="secondary"
                className="text-xs gap-1 text-blue-600 bg-blue-500/10"
              >
                <GitBranch className="h-3 w-3" />
                {stats?.totalRepos === 1
                  ? "1 repo"
                  : `${stats?.totalRepos ?? 0} repos`}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Connected repositories
            </p>
            <Progress
              value={Math.min(((stats?.totalRepos ?? 0) / 20) * 100, 100)}
              className="h-1 mt-3"
            />
          </CardContent>
        </Card>

        {/* Commits Card */}
        <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-xl group hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-all duration-300" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Commits
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <GitCommit className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">
                {isLoading ? "..." : stats?.totalCommits?.toLocaleString() || 0}
              </span>
              {/* {commitsDelta !== null && (
                <Badge
                  variant="secondary"
                  className={`text-xs gap-1 ${
                    commitsDelta.up
                      ? "text-emerald-600 bg-emerald-500/10"
                      : "text-red-600 bg-red-500/10"
                  }`}
                >
                  {commitsDelta.up ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {commitsDelta.up ? "+" : ""}
                  {commitsDelta.pct}% this month
                </Badge>
              )} */}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              In the last year
            </p>
            <Progress
              value={Math.min(((stats?.totalCommits ?? 0) / 3000) * 100, 100)}
              className="h-1 mt-3"
            />
          </CardContent>
        </Card>

        {/* Pull Requests Card */}
        <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-xl group hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-violet-500/20 transition-all duration-300" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pull Requests
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <GitPullRequest className="h-4 w-4 text-violet-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">
                {isLoading ? "..." : stats?.totalPRs || 0}
              </span>
              {prsDelta !== null && (
                <Badge
                  variant="secondary"
                  className={`text-xs gap-1 ${
                    prsDelta.up
                      ? "text-emerald-600 bg-emerald-500/10"
                      : "text-red-600 bg-red-500/10"
                  }`}
                >
                  {prsDelta.up ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {prsDelta.up ? "+" : ""}
                  {prsDelta.pct}% this month
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              All time contributions
            </p>
            <Progress
              value={Math.min(((stats?.totalPRs ?? 0) / 500) * 100, 100)}
              className="h-1 mt-3"
            />
          </CardContent>
        </Card>

        {/* AI Reviews Card */}
        <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-xl group hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-500/20 transition-all duration-300" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              AI Reviews
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Zap className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">
                {isLoading ? "..." : stats?.totalReviews || 0}
              </span>
              <Badge
                variant="secondary"
                className="text-xs gap-1 text-emerald-600 bg-emerald-500/10"
              >
                <Activity className="h-3 w-3" />
                Active
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              AI Generated Reviews
            </p>
            <Progress
              value={Math.min(((stats?.totalReviews ?? 0) / 200) * 100, 100)}
              className="h-1 mt-3"
            />
          </CardContent>
        </Card>
      </div>

      {/* Activity Overview with Tabs - 3D Charts */}
      <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 overflow-hidden">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Activity Overview
              </CardTitle>
              <CardDescription>
                Monthly breakdown of your development activity
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <Separator className="mb-2" />
        <CardContent className="pt-6">
          <Tabs
            defaultValue="bar"
            className="w-full"
            onValueChange={handleTabChange}
          >
            <TabsList className="mb-6 bg-muted/50">
              <TabsTrigger
                value="bar"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-blue-500/20"
              >
                Bar Chart
              </TabsTrigger>
              <TabsTrigger
                value="area"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-blue-500/20"
              >
                Area Chart
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bar" className="mt-0">
              {isLoadingActivity ? (
                <div className="h-[350px] w-full flex items-center justify-center">
                  <Spinner className="h-8 w-8" />
                </div>
              ) : (
                <div className="h-[350px] w-full" key={barChartKey}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={monthlyActivity || []}
                      margin={{ top: 20, right: 30, left: -10, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorCommits3D"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#10b981"
                            stopOpacity={1}
                          />
                          <stop
                            offset="100%"
                            stopColor="#059669"
                            stopOpacity={0.8}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorPRs3D"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#3b82f6"
                            stopOpacity={1}
                          />
                          <stop
                            offset="100%"
                            stopColor="#2563eb"
                            stopOpacity={0.8}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorReviews3D"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#8b5cf6"
                            stopOpacity={1}
                          />
                          <stop
                            offset="100%"
                            stopColor="#7c3aed"
                            stopOpacity={0.8}
                          />
                        </linearGradient>
                        {/* Drop shadow filter */}
                        <filter
                          id="shadow"
                          x="-20%"
                          y="-20%"
                          width="140%"
                          height="140%"
                        >
                          <feDropShadow
                            dx="2"
                            dy="4"
                            stdDeviation="3"
                            floodOpacity="0.3"
                          />
                        </filter>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="hsl(var(--border))"
                        opacity={0.3}
                      />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "currentColor",
                          fontSize: 12,
                        }}
                        dy={10}
                        className="text-muted-foreground"
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "currentColor",
                          fontSize: 12,
                        }}
                        dx={-10}
                        className="text-muted-foreground"
                      />
                      <Tooltip
                        cursor={{
                          fill: "hsl(var(--muted))",
                          opacity: 0.2,
                          radius: 8,
                        }}
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const colorMap: Record<string, string> = {
                              commits: "#10b981",
                              prs: "#3b82f6",
                              reviews: "#8b5cf6",
                            };
                            return (
                              <div className="rounded-xl border-2 border-border/50 bg-background/5 p-4 shadow-2xl backdrop-blur-md">
                                <p className="font-bold text-lg mb-3 text-muted-foreground">
                                  {label}
                                </p>
                                {payload.map((entry, index) => {
                                  const color =
                                    colorMap[entry.dataKey as string] ||
                                    "#888888";
                                  return (
                                    <div
                                      key={index}
                                      className="flex items-center gap-3 text-sm py-1.5"
                                    >
                                      <div
                                        className="h-4 w-4 rounded-md shadow-lg"
                                        style={{
                                          backgroundColor: color,
                                        }}
                                      />
                                      <span className="text-muted-foreground font-medium">
                                        {entry.name}:
                                      </span>
                                      <span className="font-bold text-foreground">
                                        {entry.value}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend
                        verticalAlign="top"
                        height={50}
                        iconType="square"
                        iconSize={12}
                        wrapperStyle={{ paddingBottom: "20px" }}
                        formatter={(value) => (
                          <span className="text-sm font-medium text-muted-foreground ml-1">
                            {value}
                          </span>
                        )}
                        payload={[
                          {
                            value: "Commits",
                            type: "square",
                            color: "#10b981",
                          },
                          {
                            value: "Pull Requests",
                            type: "square",
                            color: "#3b82f6",
                          },
                          {
                            value: "AI Reviews",
                            type: "square",
                            color: "#8b5cf6",
                          },
                        ]}
                      />
                      <Bar
                        dataKey="commits"
                        name="Commits"
                        fill="url(#colorCommits3D)"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={45}
                        shape={(props: any) => (
                          <Custom3DBar {...props} name="Commits" />
                        )}
                        animationDuration={800}
                        animationEasing="ease-out"
                      />
                      <Bar
                        dataKey="prs"
                        name="Pull Requests"
                        fill="url(#colorPRs3D)"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={45}
                        shape={(props: any) => (
                          <Custom3DBar {...props} name="PRs" />
                        )}
                        animationDuration={800}
                        animationEasing="ease-out"
                        animationBegin={150}
                      />
                      <Bar
                        dataKey="reviews"
                        name="AI Reviews"
                        fill="url(#colorReviews3D)"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={45}
                        shape={(props: any) => (
                          <Custom3DBar {...props} name="Reviews" />
                        )}
                        animationDuration={800}
                        animationEasing="ease-out"
                        animationBegin={300}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </TabsContent>

            <TabsContent value="area" className="mt-0">
              {isLoadingActivity ? (
                <div className="h-[350px] w-full flex items-center justify-center">
                  <Spinner className="h-8 w-8" />
                </div>
              ) : (
                <AnimatedAreaChart
                  key={areaChartKey}
                  data={monthlyActivity || []}
                  isLoading={isLoadingActivity}
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* ── Contribution Graph ────────────────────────────────────────── */}
      <ContributionGraph
        data={contributionData}
        isLoading={isLoadingContributions}
        userId={session?.user?.id}
      />

      {/* ── Analytics sections ─────────────────────────────────────────── */}

      {/* Developer Insights */}
      <DeveloperMetrics
        data={developerMetrics}
        isLoading={isLoadingDeveloperMetrics}
      />

      {/* Issue Intelligence activity feed */}
      <IssueActivityFeed />
    </div>
  );
};

export default MainPage;
