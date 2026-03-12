export type ReviewStatus = "completed" | "failed" | "pending";

export interface ReviewItem {
  id: string;
  prTitle: string;
  prNumber: number;
  prUrl: string;
  status: ReviewStatus;
  createdAt: string;
  repository: {
    fullName: string;
  };
}
