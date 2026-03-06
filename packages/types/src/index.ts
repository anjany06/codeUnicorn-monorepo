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
  lastIndexedCommit?: string | null;
  indexedAt?: string | null;
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

// ─── Review types (Feature 1: Line-level comments + Feature 5: Auto-fix) ────

export interface LineComment {
  path: string;
  startLine: number;
  endLine: number;
  body: string;
  suggestion?: string;
  severity: "low" | "medium" | "high" | "critical";
}

export interface StructuredReview {
  summary: string;
  walkthrough: string;
  strengths: string[];
  lineComments: LineComment[];
  overallComments: string[];
}

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

// ─── GitHub types (Feature 1: Richer diff data) ─────────────────────────────

export interface GitHubFile {
  path: string;
  content: string;
}

export interface PullRequestFile {
  filename: string;
  status: "added" | "modified" | "removed" | "renamed" | "copied" | "changed" | "unchanged";
  patch: string;
  sha: string;
  additions: number;
  deletions: number;
  changes: number;
}

export interface PullRequestDiff {
  title: string;
  description: string | null;
  diff: string;
  files: PullRequestFile[];
  headSha: string;
}

// Subscription types
export type SubscriptionTier = "FREE" | "PRO";

export interface TierLimits {
  repositories: number;
  reviewsPerRepo: number;
}

// ─── Feature 4: Review Config ───────────────────────────────────────────────

export interface ReviewConfig {
  id: string;
  repositoryId: string;
  language?: string | null;
  focusAreas: string[];
  severityThreshold: "low" | "medium" | "high";
  ignorePaths: string[];
  customRules?: string | null;
  autoFix: boolean;
  enabled: boolean;
}

// ─── Feature 2: AI Codebase Chat ────────────────────────────────────────────

export interface ChatSession {
  id: string;
  repositoryId: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages?: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  chatSessionId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}