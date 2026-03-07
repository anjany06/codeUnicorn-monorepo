"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllIssueAnalyses, type IssueAnalysis } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, GitBranch, Loader2 } from "lucide-react";
import Link from "next/link";

function parseAnalysis(raw: string) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function IssueActivityFeed() {
  const { data: analyses = [], isLoading } = useQuery({
    queryKey: ["all-issue-analyses"],
    queryFn: getAllIssueAnalyses,
    refetchInterval: 30_000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Issue Intelligence
          </CardTitle>
          <CardDescription>Recent AI-analyzed GitHub issues</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (analyses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Issue Intelligence
          </CardTitle>
          <CardDescription>Recent AI-analyzed GitHub issues</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-6">
            No issues analyzed yet. Enable Issue Intelligence in your repository
            settings.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <GitBranch className="h-4 w-4" />
          Issue Intelligence
        </CardTitle>
        <CardDescription>
          Recent AI-analyzed GitHub issues ({analyses.length})
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {analyses.map((analysis: IssueAnalysis) => {
          const parsed = parseAnalysis(analysis.analysis);
          return (
            <div
              key={analysis.id}
              className="flex flex-col gap-1.5 p-3 rounded-md border bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground font-mono">
                      {analysis.repository?.fullName ?? "—"} #
                      {analysis.issueNumber}
                    </span>
                    {analysis.postedComment && (
                      <Badge variant="outline" className="text-xs h-4">
                        commented
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm font-medium truncate mt-0.5">
                    {analysis.issueTitle}
                  </p>
                  {parsed?.summary && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {parsed.summary}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-xs text-muted-foreground">
                    {timeAgo(analysis.createdAt)}
                  </span>
                  <Link
                    href={analysis.issueUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                  </Link>
                </div>
              </div>
              {parsed?.suggestedLabels?.length > 0 && (
                <div className="flex gap-1.5 flex-wrap">
                  {parsed.suggestedLabels.slice(0, 4).map((label: string) => (
                    <Badge
                      key={label}
                      variant="secondary"
                      className="text-xs h-5"
                    >
                      {label}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
