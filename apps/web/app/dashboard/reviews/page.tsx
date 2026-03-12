"use client";

import { useQuery } from "@tanstack/react-query";
import { getReviews } from "@/lib/api";
import { ReviewRow } from "./_components/review-row";
import { ReviewsEmptyState } from "./_components/reviews-empty-state";
import { ReviewsLoading } from "./_components/reviews-loading";
import { ReviewItem } from "./_components/types";

export default function ReviewsPage() {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ["reviews"],
    queryFn: async () => {
      return await getReviews();
    },
  });

  if (isLoading) {
    return <ReviewsLoading />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10 px-4 sm:px-6">
      <div>
        <h1 className="text-2xl font-heading font-semibold">Review History</h1>
        <p className="text-md text-muted-foreground">
          A complete log of all code reviews performed across your repositories.
        </p>
      </div>

      <div className="border border-border/60 rounded-xl bg-card shadow-sm overflow-hidden">
        {!reviews || reviews.length === 0 ? (
          <ReviewsEmptyState />
        ) : (
          <>
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-muted/40 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <div className="col-span-6">Pull Request</div>
              <div className="col-span-3">Repository</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-1" />
            </div>

            <div className="divide-y divide-border/40">
              {reviews.map((review: ReviewItem) => (
                <ReviewRow key={review.id} review={review} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
