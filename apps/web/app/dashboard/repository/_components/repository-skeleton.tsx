import { Skeleton } from "@/components/ui/skeleton";

export function RepositoryListSkeleton() {
  return (
    <div className="border border-border/50 rounded-lg bg-background overflow-hidden">
      <div className="flex flex-col divide-y divide-border/50">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 px-5"
          >
            {/* Repo Info */}
            <div className="flex flex-col gap-2 min-w-0 flex-1">
              
              {/* Name */}
              <Skeleton className="h-4 w-48" />

              {/* Description */}
              <Skeleton className="h-3 w-full max-w-md" />

              {/* Meta */}
              <div className="flex items-center gap-4 mt-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-10" />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}