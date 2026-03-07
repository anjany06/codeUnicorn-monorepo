"use client";

import React, { useMemo, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getContributionDataPublic } from "@/lib/api";
import type { ContributionDay } from "@/lib/api";
import {
  THEMES,
  type HeatmapTheme,
} from "@/app/dashboard/_components/contribution-graph";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function EmbedPage() {
  const params = useParams<{ userId: string }>();
  const searchParams = useSearchParams();

  const themeId = searchParams.get("theme") || "github";
  const theme: HeatmapTheme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];

  // Check system preference for dark mode
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const colors = isDark ? theme.dark : theme.light;

  const { data, isLoading } = useQuery({
    queryKey: ["contribution-embed", params.userId],
    queryFn: () => getContributionDataPublic(params.userId),
    staleTime: 1000 * 60 * 10,
  });

  const monthMarkers = useMemo(() => {
    if (!data?.weeks?.length) return [];
    const markers: { label: string; col: number }[] = [];
    let lastMonth = -1;
    data.weeks.forEach((week, i) => {
      if (!week.length) return;
      const m = new Date(week[0].date).getMonth();
      if (m !== lastMonth) {
        markers.push({ label: MONTH_LABELS[m], col: i });
        lastMonth = m;
      }
    });
    return markers;
  }, [data]);

  const cellSize = 12;
  const gap = 3;
  const step = cellSize + gap;

  const bgColor = isDark ? "#0d1117" : "#ffffff";
  const textColor = isDark ? "#8b949e" : "#57606a";

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: bgColor,
          color: textColor,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          fontSize: 14,
        }}
      >
        Loading contributions...
      </div>
    );
  }

  if (!data?.weeks?.length) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: bgColor,
          color: textColor,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          fontSize: 14,
        }}
      >
        No contribution data
      </div>
    );
  }

  const svgWidth = data.weeks.length * step + 30;
  const svgHeight = 7 * step + 30;

  return (
    <div
      style={{
        backgroundColor: bgColor,
        padding: "20px 24px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {data.avatarUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.avatarUrl}
              alt={data.githubLogin}
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
              }}
            />
          )}
          <span
            style={{
              color: textColor,
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            @{data.githubLogin}
          </span>
        </div>
        <span style={{ color: textColor, fontSize: 12 }}>
          <strong style={{ color: isDark ? "#e6edf3" : "#1f2328" }}>
            {data.totalContributions.toLocaleString()}
          </strong>{" "}
          contributions
        </span>
      </div>

      {/* Heatmap */}
      <div style={{ overflowX: "auto" }}>
        <svg width={svgWidth} height={svgHeight}>
          {/* Day labels */}
          {DAY_LABELS.map(
            (label, i) =>
              label && (
                <text
                  key={i}
                  x={0}
                  y={i * step + 24}
                  fill={textColor}
                  fontSize={10}
                  dominantBaseline="middle"
                >
                  {label}
                </text>
              ),
          )}

          {/* Month labels */}
          {monthMarkers.map(({ label, col }, i) => (
            <text
              key={i}
              x={col * step + 30}
              y={8}
              fill={textColor}
              fontSize={10}
            >
              {label}
            </text>
          ))}

          {/* Cells */}
          {data.weeks.map((week, wi) => (
            <g key={wi} transform={`translate(${wi * step + 30}, 16)`}>
              {week.map((day: ContributionDay, di: number) => (
                <rect
                  key={di}
                  y={di * step}
                  width={cellSize}
                  height={cellSize}
                  rx={2.5}
                  fill={colors[day.level]}
                  style={{ outline: "1px solid rgba(128,128,128,0.08)" }}
                >
                  <title>
                    {day.count} contribution{day.count !== 1 ? "s" : ""} on{" "}
                    {formatDate(day.date)}
                  </title>
                </rect>
              ))}
            </g>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 4,
          marginTop: 8,
          fontSize: 10,
          color: textColor,
        }}
      >
        <span style={{ marginRight: 2 }}>Less</span>
        {colors.map((c, i) => (
          <span
            key={i}
            style={{
              display: "inline-block",
              width: 12,
              height: 12,
              borderRadius: 2,
              backgroundColor: c,
            }}
          />
        ))}
        <span style={{ marginLeft: 2 }}>More</span>
      </div>

      {/* Powered-by footer */}
      <div
        style={{
          marginTop: 12,
          textAlign: "center",
          fontSize: 10,
          color: textColor,
          opacity: 0.6,
        }}
      >
        Powered by{" "}
        <a
          href={typeof window !== "undefined" ? window.location.origin : "#"}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: theme.accent, textDecoration: "none" }}
        >
          CodeUnicorn
        </a>
      </div>
    </div>
  );
}
