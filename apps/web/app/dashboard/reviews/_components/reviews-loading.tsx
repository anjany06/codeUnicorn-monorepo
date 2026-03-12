export function ReviewsLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10 px-4 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Review History</h1>
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
