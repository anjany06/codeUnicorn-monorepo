import { Skeleton } from "@/components/ui/skeleton";

export function RepositoryRowSkeletons({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="group flex flex-col gap-3 md:flex-row md:items-center md:justify-between p-4 md:px-5"
        >
          {/* Repo Info */}
          <div className="flex flex-col gap-2 min-w-0 flex-1">
            {/* Name row */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-44" />
            </div>
            {/* Description */}
            <Skeleton className="h-3 w-full max-w-md" />
            {/* Meta */}
            <div className="flex items-center gap-4 mt-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-10" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between md:justify-end gap-2 shrink-0">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        </div>
      ))}
    </>
  );
}

export function RepositoryListSkeleton() {
  return (
    <div className="w-full border border-border/50 rounded-xl bg-background overflow-hidden">
      <div className="flex flex-col divide-y divide-border/50">
        <RepositoryRowSkeletons count={6} />
      </div>
    </div>
  );
}
