import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  if (status === "completed") {
    return (
      <Badge
        variant="outline"
        className="text-green-600 border-green-500 dark:text-green-400"
      >
        Ready
      </Badge>
    );
  }

  if (status === "pending") {
    return (
      <Badge
        variant="outline"
        className="text-yellow-600 border-yellow-500 dark:text-yellow-400"
      >
        Generating...
      </Badge>
    );
  }

  if (status === "failed") {
    return (
      <Badge
        variant="outline"
        className="text-red-600 border-red-500 dark:text-red-400"
      >
        Failed
      </Badge>
    );
  }

  return null;
}
