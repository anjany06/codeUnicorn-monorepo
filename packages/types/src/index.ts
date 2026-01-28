// User types
export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export interface Session {
  user: User;
  expires: string;
}

// Repository types
export interface Repository {
  id: string;
  githubId: bigint;
  name: string;
  owner: string;
  fullName: string;
  url: string;
  userId: string;
  isConnected?: boolean;
}

export interface ConnectRepositoryInput {
  owner: string;
  repo: string;
  githubId: number;
}

// Dashboard types
export interface DashboardStats {
  totalCommits: number;
  totalPRs: number;
  totalReviews: number;
  totalRepos: number;
}

export interface MonthlyActivity {
  month: string;
  commits: number;
  prs: number;
  reviews: number;
}

// Review types
export interface Review {
  id: string;
  repositoryId: string;
  prNumber: number;
  prTitle: string;
  prUrl: string;
  review: string;
  status: "pending" | "completed" | "failed";
  createdAt: Date;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// GitHub types
export interface GitHubFile {
  path: string;
  content: string;
}

export interface PullRequestDiff {
  title: string;
  diff: string;
  files: GitHubFile[];
}

// Subscription types
export type SubscriptionTier = "FREE" | "PRO";

export interface TierLimits {
  repositories: number;
  reviewsPerRepo: number;
}