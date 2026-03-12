"use client";

import { useQuery } from "@tanstack/react-query";
import { getContributionData, getDashboardStats, getDeveloperMetrics, getMonthlyActivity } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { ContributionGraph } from "./_components/contribution-graph";
import { DashboardHeader } from "./_components/dashboard-header";
import { DashboardStatsGrid } from "./_components/dashboard-stats-grid";
import { DeveloperMetrics } from "./_components/developer-metrics";
import { IssueActivityFeed } from "./_components/issue-activity";

const MainPage = () => {
  const { data: session } = useSession();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => await getDashboardStats(),
    refetchOnWindowFocus: false,
  });

  useQuery({
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

  return (
    <div className="space-y-8 pb-10">
      <DashboardHeader />

      <DashboardStatsGrid stats={stats ?? null} isLoading={isLoading} />

      <ContributionGraph
        data={contributionData}
        isLoading={isLoadingContributions}
        userId={session?.user?.id}
      />

      <DeveloperMetrics
        data={developerMetrics}
        isLoading={isLoadingDeveloperMetrics}
      />

      <IssueActivityFeed />
    </div>
  );
};

export default MainPage;
