import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { ReviewStatus } from "./types";

export function ReviewStatusIcon({ status }: { status: ReviewStatus }) {
  if (status === "completed") {
    return <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />;
  }

  if (status === "failed") {
    return <XCircle className="h-4 w-4 text-rose-500 mt-0.5 shrink-0" />;
  }

  return <Clock className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />;
}
