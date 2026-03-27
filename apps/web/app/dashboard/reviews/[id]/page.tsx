"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { getReviewById } from "@/lib/api";
import {
  ArrowLeft,
  ExternalLink,
  Github,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Zap,
  Lightbulb,
  MessageSquare,
  FileCode2,
  ChevronDown,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";

// Severity badge styling
function SeverityBadge({ severity }: { severity: string }) {
  const styles: Record<string, string> = {
    low: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    high: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    critical: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${styles[severity] || styles.low}`}
    >
      {severity.toUpperCase()}
    </span>
  );
}

// Category badge
function CategoryBadge({ category }: { category: string }) {
  const icons: Record<string, React.ReactNode> = {
    bug: <AlertTriangle className="h-3 w-3" />,
    security: <Shield className="h-3 w-3" />,
    performance: <Zap className="h-3 w-3" />,
    style: <FileCode2 className="h-3 w-3" />,
    "best-practice": <CheckCircle2 className="h-3 w-3" />,
  };

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted/50 text-muted-foreground border border-border/40">
      {icons[category] || <MessageSquare className="h-3 w-3" />}
      {category}
    </span>
  );
}

// Render walkthrough with styled file path headers
function renderWalkthrough(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    // Match markdown headings like ### `file.ts` or ### file.ts
    const headingMatch = line.match(/^(#{1,4})\s+`?([^`]+)`?\s*$/);
    if (headingMatch && headingMatch[2]) {
      const filePath = headingMatch[2].trim();
      return (
        <div
          key={i}
          className="flex items-center gap-2 mt-4 mb-2 px-3 py-2 rounded-lg bg-muted/40 border border-border/40"
        >
          <FileCode2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="text-sm font-semibold font-mono text-foreground">{filePath}</span>
        </div>
      );
    }

    // Render inline backtick code with styling
    const parts = line.split(/(`[^`]+`)/);
    const rendered = parts.map((part, j) => {
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={j}
            className="px-1.5 py-0.5 rounded bg-muted/50 border border-border/30 text-xs font-mono text-emerald-400"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return <span key={j}>{part}</span>;
    });

    if (!line.trim()) return <div key={i} className="h-2" />;
    return (
      <p key={i} className="text-sm text-muted-foreground leading-relaxed">
        {rendered}
      </p>
    );
  });
}

// Collapsible section
function Section({
  title,
  icon,
  count,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: React.ReactNode;
  count?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details open={defaultOpen} className="group border border-border/50 rounded-xl bg-card overflow-hidden">
      <summary className="flex items-center gap-3 px-5 py-4 cursor-pointer select-none hover:bg-muted/30 transition-colors">
        <span className="text-muted-foreground">{icon}</span>
        <h2 className="text-sm font-semibold flex-1">{title}</h2>
        {count !== undefined && (
          <span className="text-xs font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
            {count}
          </span>
        )}
        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-5 pb-5 pt-1">{children}</div>
    </details>
  );
}

export default function ReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { data: review, isLoading } = useQuery({
    queryKey: ["review", id],
    queryFn: () => getReviewById(id),
    refetchInterval: (query) => {
      const data = query.state.data;
      return data?.status === "pending" ? 5000 : false;
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="space-y-6">
          <div className="h-8 w-48 bg-muted/30 animate-pulse rounded-lg" />
          <div className="h-64 bg-muted/20 animate-pulse rounded-xl" />
          <div className="h-48 bg-muted/20 animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 text-center">
        <h1 className="text-xl font-semibold">Review not found</h1>
        <p className="text-muted-foreground mt-2">This review doesn&apos;t exist or you don&apos;t have access.</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/reviews">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Reviews
          </Link>
        </Button>
      </div>
    );
  }

  // Pending state
  if (review.status === "pending") {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link href="/dashboard/reviews">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Reviews
          </Link>
        </Button>
        <div className="border border-border/50 rounded-xl bg-card p-10 text-center">
          <Loader2 className="h-10 w-10 text-amber-500 animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-semibold">Review in Progress</h2>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            AI is analyzing <span className="font-medium text-foreground">{review.prTitle}</span>. This usually takes 30-60 seconds.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Github className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{review.repository?.fullName}</span>
            <span className="text-sm text-muted-foreground">#{review.prNumber}</span>
          </div>
        </div>
      </div>
    );
  }

  // Failed state
  if (review.status === "failed") {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link href="/dashboard/reviews">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Reviews
          </Link>
        </Button>
        <div className="border border-rose-500/30 rounded-xl bg-card p-10 text-center">
          <AlertTriangle className="h-10 w-10 text-rose-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold">Review Failed</h2>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            The AI review for <span className="font-medium text-foreground">{review.prTitle}</span> could not be completed.
          </p>
          <Button variant="outline" asChild className="mt-4">
            <a href={review.prUrl} target="_blank" rel="noopener noreferrer">
              View PR on GitHub <ExternalLink className="ml-2 h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </div>
    );
  }

  // Parse the structured review JSON
  let parsed: any = {};
  try {
    parsed = JSON.parse(review.review || "{}");
  } catch {
    parsed = {};
  }

  const {
    summary = "",
    walkthrough = "",
    strengths = [],
    lineComments = [],
    overallComments = [],
    issues = [],
    suggestions = [],
    sequenceDiagram = "",
  } = parsed;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-16 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Button variant="ghost" size="sm" asChild className="w-fit">
          <Link href="/dashboard/reviews">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Reviews
          </Link>
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
              <h1 className="text-xl font-semibold leading-snug">{review.prTitle}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="font-mono border border-border px-1.5 py-0.5 rounded text-xs">
                #{review.prNumber}
              </span>
              <span className="flex items-center gap-1.5">
                <Github className="h-3.5 w-3.5" />
                {review.repository?.fullName}
              </span>
              <span>
                {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href={review.prUrl} target="_blank" rel="noopener noreferrer">
              View PR <ExternalLink className="ml-2 h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <Section title="Summary" icon={<MessageSquare className="h-4 w-4" />}>
          <p className="text-sm text-muted-foreground leading-relaxed">{summary}</p>
        </Section>
      )}

      {/* Walkthrough */}
      {walkthrough && (
        <Section title="Walkthrough" icon={<FileCode2 className="h-4 w-4" />} defaultOpen={false}>
          <div className="space-y-0.5">
            {renderWalkthrough(walkthrough)}
          </div>
        </Section>
      )}

      {/* Strengths */}
      {strengths.length > 0 && (
        <Section title="Strengths" icon={<CheckCircle2 className="h-4 w-4" />} count={strengths.length} defaultOpen={false}>
          <ul className="space-y-2">
            {strengths.map((s: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-emerald-500 mt-0.5">✓</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Issues */}
      {issues.length > 0 && (
        <Section title="Issues" icon={<AlertTriangle className="h-4 w-4" />} count={issues.length}>
          <div className="space-y-3">
            {issues.map((issue: any, i: number) => (
              <div
                key={i}
                className="border border-border/40 rounded-lg p-4 space-y-2 hover:bg-muted/10 transition-colors"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <SeverityBadge severity={issue.severity} />
                  <CategoryBadge category={issue.type} />
                  <span className="font-medium text-sm">{issue.title}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{issue.description}</p>
                {issue.location && (
                  <p className="text-xs text-muted-foreground font-mono bg-muted/30 px-2 py-1 rounded w-fit">
                    📍 {issue.location}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Inline Comments */}
      {lineComments.length > 0 && (
        <Section title="Inline Comments" icon={<MessageSquare className="h-4 w-4" />} count={lineComments.length}>
          <div className="space-y-3">
            {lineComments.map((c: any, i: number) => (
              <div
                key={i}
                className="border border-border/40 rounded-lg p-4 space-y-2 hover:bg-muted/10 transition-colors"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono bg-muted/40 px-2 py-0.5 rounded border border-border/30">
                    {c.path}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    L{c.startLine === c.endLine ? c.startLine : `${c.startLine}-${c.endLine}`}
                  </span>
                  <SeverityBadge severity={c.severity} />
                  <CategoryBadge category={c.category} />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{c.body}</p>
                {c.suggestion && (
                  <pre className="text-xs bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3 overflow-x-auto text-emerald-300">
                    <code>{c.suggestion}</code>
                  </pre>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Suggestions  */}
      {suggestions.length > 0 && (
        <Section title="Suggestions" icon={<Lightbulb className="h-4 w-4" />} count={suggestions.length} defaultOpen={false}>
          <ul className="space-y-2">
            {suggestions.map((s: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Lightbulb className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* General Observations */}
      {overallComments.length > 0 && (
        <Section title="General Observations" icon={<MessageSquare className="h-4 w-4" />} count={overallComments.length} defaultOpen={false}>
          <ul className="space-y-2">
            {overallComments.map((c: string, i: number) => (
              <li key={i} className="text-sm text-muted-foreground leading-relaxed">• {c}</li>
            ))}
          </ul>
        </Section>
      )}

      {/* Sequence Diagram */}
      {sequenceDiagram && (
        <Section title="Sequence Diagram" icon={<FileCode2 className="h-4 w-4" />} defaultOpen={false}>
          <pre className="text-xs bg-muted/30 border border-border/40 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap">
            <code>{sequenceDiagram}</code>
          </pre>
        </Section>
      )}
    </div>
  );
}
