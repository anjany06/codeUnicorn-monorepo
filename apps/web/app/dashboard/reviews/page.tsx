"use client";

import { Button } from "@/components/ui/button";
import { getReviews } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  XCircle,
  FileText,
  Github,
} from "lucide-react";

export default function ReviewsPage() {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ["reviews"],
    queryFn: async () => {
      return await getReviews();
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 pb-10 px-4 sm:px-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Review History
          </h1>
          <p className="text-sm text-muted-foreground">
            Log of AI code reviews across your repositories
          </p>
        </div>

        <div className="border border-border/50 rounded-xl bg-card overflow-hidden">
          <div className="divide-y divide-border/40">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[72px] bg-muted/10 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10 px-4 sm:px-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Review History
        </h1>

        <p className="text-sm text-muted-foreground">
          A complete log of all code reviews performed across your repositories.
        </p>
      </div>

      <div className="border border-border/60 rounded-xl bg-card shadow-sm overflow-hidden">
        {!reviews || reviews.length === 0 ? (
          <div className="py-20 flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full border bg-muted/30 flex items-center justify-center mb-4">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>

            <h3 className="text-sm font-medium">No reviews yet</h3>

            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Connect a repository and open a pull request to see AI reviews
              here.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-muted/40 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <div className="col-span-6">Pull Request</div>
              <div className="col-span-3">Repository</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-1"></div>
            </div>

            <div className="divide-y divide-border/40">
              {reviews.map((review: any) => (
                <div
                  key={review.id}
                  className="p-4 hover:bg-muted/10 transition-all duration-200 hover:shadow-sm"
                >
                  {/* MOBILE */}
                  <div className="flex flex-col gap-3 md:hidden">
                    <div className="flex items-start gap-2">
                      {review.status === "completed" && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-1" />
                      )}

                      {review.status === "failed" && (
                        <XCircle className="h-4 w-4 text-rose-500 mt-1" />
                      )}

                      {review.status === "pending" && (
                        <Clock className="h-4 w-4 text-amber-500 mt-1" />
                      )}

                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-sm break-words">
                          {review.prTitle}
                        </span>

                        <span className="text-xs text-muted-foreground font-mono">
                          #{review.prNumber}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Github className="h-3.5 w-3.5" />
                      {review.repository.fullName}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(review.createdAt), {
                          addSuffix: true,
                        })}
                      </span>

                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                        className="h-7 text-xs"
                      >
                        <a
                          href={review.prUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View PR
                          <ExternalLink className="ml-1.5 h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  </div>

                  {/* DESKTOP */}
                  <div className="hidden md:grid grid-cols-12 gap-4 items-start">
                    <div className="col-span-6 flex items-start gap-3 min-w-0">
                      {review.status === "completed" && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      )}

                      {review.status === "failed" && (
                        <XCircle className="h-4 w-4 text-rose-500 mt-0.5 shrink-0" />
                      )}

                      {review.status === "pending" && (
                        <Clock className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                      )}

                      <div className="flex flex-col min-w-0">
                        <span className="font-medium text-sm leading-snug line-clamp-2 break-words">
                          {review.prTitle}
                        </span>

                        <span className="text-xs text-muted-foreground border border-border w-fit px-1.5 py-0.5 rounded-md font-mono mt-1">
                          #{review.prNumber}
                        </span>
                      </div>
                    </div>

                    <div className="col-span-3 text-sm text-muted-foreground flex items-center gap-2 min-w-0">
                      <Github className="h-3.5 w-3.5 opacity-70 shrink-0" />
                      <span className="truncate">
                        {review.repository.fullName}
                      </span>
                    </div>

                    <div className="col-span-2 text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(review.createdAt), {
                        addSuffix: true,
                      })}
                    </div>

                    <div className="col-span-1 flex justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        asChild
                        className="h-7 text-xs"
                      >
                        <a
                          href={review.prUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
