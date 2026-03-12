import { formatDistanceToNow } from "date-fns";
import { ExternalLink, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReviewStatusIcon } from "./review-status-icon";
import { ReviewItem } from "./types";

export function ReviewRow({ review }: { review: ReviewItem }) {
  return (
    <div className="p-4 hover:bg-muted/10 transition-all duration-200 hover:shadow-sm">
      <div className="flex flex-col gap-3 md:hidden">
        <div className="flex items-start gap-2">
          <ReviewStatusIcon status={review.status} />
          <div className="flex flex-col gap-1">
            <span className="font-medium text-sm break-words">{review.prTitle}</span>
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
            {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
          </span>
          <Button size="sm" variant="outline" asChild className="h-7 text-xs">
            <a href={review.prUrl} target="_blank" rel="noopener noreferrer">
              View PR
              <ExternalLink className="ml-1.5 h-3 w-3" />
            </a>
          </Button>
        </div>
      </div>

      <div className="hidden md:grid grid-cols-12 gap-4 items-start">
        <div className="col-span-6 flex items-start gap-3 min-w-0">
          <ReviewStatusIcon status={review.status} />
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
          <span className="truncate">{review.repository.fullName}</span>
        </div>

        <div className="col-span-2 text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
        </div>

        <div className="col-span-1 flex justify-end">
          <Button size="sm" variant="ghost" asChild className="h-7 text-xs">
            <a href={review.prUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
