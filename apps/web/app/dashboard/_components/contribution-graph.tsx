"use client";
import React from "react";
import { ActivityCalendar } from "react-activity-calendar";
import { useTheme } from "next-themes";
import { useQuery } from "@tanstack/react-query";
import { getContributionStats } from "..";

const ContributionGraph = () => {
  const { theme } = useTheme();

  const { data, isLoading } = useQuery({
    queryKey: ["contribution-graph"],
    queryFn: async () => await getContributionStats(),
    staleTime: 1000 * 60 * 5, //5 minutes
  });

  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-8">
        <div className="animate-pulse text-muted-foreground">
          Loading Contribution data...
        </div>
      </div>
    );
  }

  if (!data || !data.contributions.length) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-8">
        <div className="text-muted-foreground">
          No contribution data available
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center gap-4 p-4">
      <div className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">
          {data.totalContributions}
        </span>{" "}
        contributions in the last year
      </div>

      {/* Centered Heatmap Container */}
      <div className="w-full flex justify-center overflow-x-auto">
        <div className="inline-block">
          <ActivityCalendar
            data={data.contributions}
            colorScheme={theme === "dark" ? "dark" : "light"}
            blockSize={12}
            blockMargin={4}
            fontSize={14}
            showWeekdayLabels
            labels={{
              legend: {
                less: "Less",
                more: "More",
              },
            }}
            theme={{
              light: [
                "hsl(0, 0%, 92%)", // 0 contributions
                "#9be9a8", // 1-3 contributions
                "#40c463", // 4-6 contributions
                "#30a14e", // 7-9 contributions
                "#216e39", // 10+ contributions
              ],
              dark: [
                "#161b22", // 0 contributions
                "#0e4429", // 1-3 contributions
                "#006d32", // 4-6 contributions
                "#26a641", // 7-9 contributions
                "#39d353", // 10+ contributions
              ],
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ContributionGraph;
