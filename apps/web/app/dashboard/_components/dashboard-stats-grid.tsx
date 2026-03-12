import { GitBranch, GitCommit, GitPullRequest, Zap } from "lucide-react";
import { DashboardStatCard } from "./dashboard-stat-card";

type DashboardStats = {
  totalCommits: number;
  totalPRs: number;
  totalReviews: number;
  totalRepos: number;
} | null;

type DashboardStatsGridProps = {
  stats: DashboardStats;
  isLoading: boolean;
};

function loadingValue(isLoading: boolean, value: string | number) {
  return isLoading ? "..." : value;
}

function toProgress(value: number, max: number) {
  return Math.min((value / max) * 100, 100);
}

export function DashboardStatsGrid({ stats, isLoading }: DashboardStatsGridProps) {
  const totalRepos = stats?.totalRepos ?? 0;
  const totalCommits = stats?.totalCommits ?? 0;
  const totalPRs = stats?.totalPRs ?? 0;
  const totalReviews = stats?.totalReviews ?? 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <DashboardStatCard
        title="Repositories"
        value={loadingValue(isLoading, totalRepos)}
        subtitle="Connected repositories"
        progress={toProgress(totalRepos, 20)}
        icon={GitBranch}
      />

      <DashboardStatCard
        title="Total Commits"
        value={loadingValue(isLoading, totalCommits.toLocaleString())}
        subtitle="In the last year"
        progress={toProgress(totalCommits, 3000)}
        icon={GitCommit}
      />

      <DashboardStatCard
        title="Pull Requests"
        value={loadingValue(isLoading, totalPRs)}
        subtitle="All time contributions"
        progress={toProgress(totalPRs, 500)}
        icon={GitPullRequest}
      />

      <DashboardStatCard
        title="AI Reviews"
        value={loadingValue(isLoading, totalReviews)}
        subtitle="AI Generated Reviews"
        progress={toProgress(totalReviews, 200)}
        icon={Zap}
      />
    </div>
  );
}
