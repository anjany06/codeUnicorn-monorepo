import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type DashboardStatCardProps = {
  title: string;
  value: number | string;
  subtitle: string;
  progress: number;
  icon: LucideIcon;
};

export function DashboardStatCard({
  title,
  value,
  subtitle,
  progress,
  icon: Icon,
}: DashboardStatCardProps) {
  return (
    <Card
      className="relative overflow-hidden border-border/50 bg-linear-to-br from-card to-card/50 group transition-shadow duration-300 hover:shadow-lg"
      style={{
        boxShadow:
          "0 1px 0 0 rgba(255,255,255,0.06) inset, 0 4px 20px -4px rgba(0,0,0,0.25), 0 1px 4px rgba(0,0,0,0.1)",
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 40%, rgba(255,255,255,0.1) 60%, transparent 100%)",
        }}
      />

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div
          className="h-9 w-9 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300"
          style={{
            background:
              "linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--card)) 100%)",
            boxShadow:
              "0 1px 0 rgba(255,255,255,0.08) inset, 0 2px 4px rgba(0,0,0,0.15)",
            border: "1px solid hsl(var(--border))",
          }}
        >
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">{value}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        <Progress value={progress} className="h-1 mt-3" />
      </CardContent>
    </Card>
  );
}
