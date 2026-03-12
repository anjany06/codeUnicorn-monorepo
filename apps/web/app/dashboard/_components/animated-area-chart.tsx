import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ActivityPoint = {
  month: string;
  commits: number;
  prs: number;
  reviews: number;
};

type AnimatedAreaChartProps = {
  data: ActivityPoint[];
  isLoading: boolean;
};

export function AnimatedAreaChart({ data, isLoading }: AnimatedAreaChartProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (!isLoading && data?.length) {
      setAnimationKey((prev) => prev + 1);
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, data]);

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
            from { stroke-dashoffset: 2000; }
            to { stroke-dashoffset: 0; }
          }
          @keyframes fadeInFill {
            from { opacity: 0; }
            to { opacity: 1; }
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
            <linearGradient id="areaCommitsAnimated" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="50%" stopColor="#10b981" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="areaPRsAnimated" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="areaReviewsAnimated" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>

            <linearGradient id="lineGradientGreen" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
              <stop offset="100%" stopColor="#34d399" stopOpacity={1} />
            </linearGradient>
            <linearGradient id="lineGradientBlue" x1="0%" y1="0%" x2="100%" y2="0%">
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

            <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
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
            <filter id="glow-purple" x="-50%" y="-50%" width="200%" height="200%">
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
            tick={{ fill: "currentColor", fontSize: 12 }}
            dy={10}
            className="text-muted-foreground"
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "currentColor", fontSize: 12 }}
            dx={-10}
            className="text-muted-foreground"
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload || payload.length === 0) return null;

              const uniquePayload = payload.filter(
                (entry, index, entries) =>
                  index === entries.findIndex((item) => item.dataKey === entry.dataKey),
              );

              return (
                <div className="rounded-xl border bg-background/5 p-4 shadow-2xl backdrop-blur-md">
                  <p className="font-bold text-lg mb-3 text-muted-foreground">{label}</p>
                  {uniquePayload.map((entry, index) => {
                    const color = colorMap[entry.dataKey as string] || "#888888";
                    return (
                      <div key={index} className="flex items-center gap-3 text-sm py-1">
                        <div
                          className="h-3 w-3 rounded-full shadow-lg"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-muted-foreground">{entry.name}:</span>
                        <span className="font-bold">{entry.value}</span>
                      </div>
                    );
                  })}
                </div>
              );
            }}
          />
          <Legend
            verticalAlign="top"
            height={50}
            iconType="circle"
            iconSize={10}
            formatter={(value) => (
              <span className="text-sm font-medium text-muted-foreground">{value}</span>
            )}
            payload={[
              { value: "Commits", type: "circle", color: "#10b981" },
              { value: "Pull Requests", type: "circle", color: "#3b82f6" },
              { value: "AI Reviews", type: "circle", color: "#8b5cf6" },
            ]}
          />

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
              style: { filter: "drop-shadow(0 0 8px #10b981)" },
            }}
            legendType="none"
          />
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
              style: { filter: "drop-shadow(0 0 8px #3b82f6)" },
            }}
            legendType="none"
          />
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
              style: { filter: "drop-shadow(0 0 8px #8b5cf6)" },
            }}
            legendType="none"
          />
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
}
