import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export type UsageItem = {
  label: string;
  current: number;
  limit: number | null;
  hint: string;
};

type UsageOverviewProps = {
  isLoading: boolean;
  isPro: boolean;
  usageItems: UsageItem[];
};

function getProgressValue(current: number, limit: number | null) {
  if (limit === null || limit <= 0) return 100;
  return Math.min((current / limit) * 100, 100);
}

export function UsageOverview({ isLoading, isPro, usageItems }: UsageOverviewProps) {
  return (
    <section className="rounded-xl border border-border/60 bg-card p-5 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Usage Overview
          </h2>
          <p className="text-sm text-muted-foreground">
            Track your current plan limits at a glance.
          </p>
        </div>

        <Badge variant="outline" className="w-fit gap-1.5">
          {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {isLoading ? "Loading" : `${isPro ? "PRO" : "FREE"} Plan`}
        </Badge>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {usageItems.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-border/60 bg-muted/20 p-4"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              <p className="text-xs font-semibold text-muted-foreground">
                {isLoading
                  ? "--"
                  : item.limit === null
                    ? "Unlimited"
                    : `${item.current}/${item.limit}`}
              </p>
            </div>

            <Progress
              value={isLoading ? 0 : getProgressValue(item.current, item.limit)}
              className="h-2"
            />

            <p className="mt-2 text-xs text-muted-foreground">{item.hint}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
