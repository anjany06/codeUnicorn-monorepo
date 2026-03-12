import { FileText } from "lucide-react";

export function ReviewsEmptyState() {
  return (
    <div className="py-20 flex flex-col items-center text-center">
      <div className="h-12 w-12 rounded-full border bg-muted/30 flex items-center justify-center mb-4">
        <FileText className="h-5 w-5 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-medium">No reviews yet</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">
        Connect a repository and open a pull request to see AI reviews here.
      </p>
    </div>
  );
}
