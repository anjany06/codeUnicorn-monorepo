const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include", // Important for sending cookies
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  return res.json();
}

async function fetchPublicApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "omit",
    headers: options?.headers,
  });

  return res.json();
}

// User/Profile API
export async function getUserProfile() {
  const res = await fetchApi<{
    id: string;
    name: string;
    email: string;
    image?: string;
  }>("/api/users/profile");
  return res.data;
}

export async function updateUserProfile(data: { name: string; email: string }) {
  const res = await fetchApi<{ id: string; name: string; email: string }>(
    "/api/users/profile",
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
  return res;
}

// Dashboard API
export async function getDashboardStats() {
  const res = await fetchApi<{
    totalCommits: number;
    totalPRs: number;
    totalReviews: number;
    totalRepos: number;
  }>("/api/dashboard/stats");
  return res.data;
}

export async function getMonthlyActivity() {
  const res = await fetchApi<
    Array<{
      month: string;
      commits: number;
      prs: number;
      reviews: number;
    }>
  >("/api/dashboard/activity");
  return res.data || [];
}

export interface DeveloperMetrics {
  prsThisMonth: number;
  prsLastMonth: number;
  commitsThisMonth: number;
  commitsLastMonth: number;
  reviewsTriggered: number;
  avgIssuesPerReview: number;
  topIssueCategories: Array<{ category: string; count: number }>;
  mostActiveRepo: string | null;
  totalReviewsAllTime: number;
  githubLogin: string;
  avatarUrl: string;
  // Commit analytics
  monthlyCommits: Array<{ month: string; year: string; commits: number }>;
  monthlyPRs: Array<{ month: string; year: string; prs: number }>;
  mostActiveMonth: string | null;
  mostActiveMonthCount: number;
  currentStreak: number;
  longestStreak: number;
  weekdayActivity: Array<{ day: string; commits: number }>;
  mostActiveDay: string | null;
}

export async function getDeveloperMetrics(): Promise<DeveloperMetrics | null> {
  const res = await fetchApi<DeveloperMetrics>("/api/dashboard/developer-metrics");
  return res.data || null;
}

// Contribution Graph types & API
export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ContributionData {
  totalContributions: number;
  weeks: ContributionDay[][];
  githubLogin: string;
  avatarUrl: string;
}

export async function getContributionData(): Promise<ContributionData | null> {
  const res = await fetchApi<ContributionData>("/api/dashboard/contributions");
  return res.data || null;
}

export async function getContributionDataPublic(
  userId: string,
): Promise<ContributionData | null> {
  const res = await fetchPublicApi<ContributionData>(
    `/api/dashboard/contributions/${userId}`,
  );
  return res.data || null;
}

// Repository API
export async function fetchRepositories(page: number = 1, perPage: number = 10) {
  const res = await fetchApi<any[]>(
    `/api/repositories?page=${page}&perPage=${perPage}`
  );
  return res.data || [];
}

export async function connectRepository(
  owner: string,
  repo: string,
  githubId: number
) {
  return fetchApi("/api/repositories/connect", {
    method: "POST",
    body: JSON.stringify({ owner, repo, githubId }),
  });
}

export async function getConnectedRepositories() {
  const res = await fetchApi<any[]>("/api/repositories/connected");
  return res.data || [];
}

export async function disconnectRepository(id: string) {
  return fetchApi(`/api/repositories/${id}`, {
    method: "DELETE",
  });
}

export async function disconnectAllRepositories() {
  return fetchApi<{ count: number }>("/api/repositories/all", {
    method: "DELETE",
  });
}

// Reviews API
export async function getReviews() {
  const res = await fetchApi<any[]>("/api/reviews");
  return res.data || [];
}

// Subscription API
export interface SubscriptionData {
  user: {
    id: string;
    name: string;
    email: string;
    subscriptionTier: string;
    subscriptionStatus: string | null;
    polarCustomerId: string | null;
    polarSubscriptionId: string | null;
  } | null;
  limits: {
    tier: "FREE" | "PRO";
    repositories: {
      current: number;
      limit: number | null;
      canAdd: boolean;
    };
    reviews: {
      [repositoryId: string]: {
        current: number;
        limit: number | null;
        canAdd: boolean;
      };
    };
    chatMessages: {
      current: number;
      limit: number | null;
      remaining: number | null;
      canAdd: boolean;
      windowHours: number | null;
      resetAt: string | null;
    };
  } | null;
}

export async function getSubscriptionData(): Promise<SubscriptionData> {
  const res = await fetchApi<SubscriptionData>("/api/subscription");
  return res.data || { user: null, limits: null };
}

export async function syncSubscriptionStatus() {
  const res = await fetchApi<{ success: boolean; status?: string; message?: string; error?: string }>(
    "/api/subscription/sync",
    { method: "POST" }
  );
  // Use the outer wrapper success (HTTP-level) — the controller always returns
  // { success: true, data: result } on 200, so res.success is the reliable flag.
  return { success: res.success, ...(res.data || {}) };
}

// ─── Feature 2: Chat API ───────────────────────────────────────────────────

export async function getChatSessions(repositoryId?: string) {
  const params = repositoryId ? `?repositoryId=${repositoryId}` : "";
  const res = await fetchApi<any[]>(`/api/chat/sessions${params}`);
  return res.data || [];
}

export async function createChatSession(repositoryId: string) {
  const res = await fetchApi<any>("/api/chat/sessions", {
    method: "POST",
    body: JSON.stringify({ repositoryId }),
  });
  return res.data;
}

export async function getChatMessages(sessionId: string) {
  const res = await fetchApi<any[]>(`/api/chat/sessions/${sessionId}/messages`);
  return res.data || [];
}

export async function deleteChatSession(sessionId: string) {
  return fetchApi(`/api/chat/sessions/${sessionId}`, { method: "DELETE" });
}

/**
 * Stream a chat message response via SSE.
 * Returns an async generator that yields content chunks.
 */
export async function* streamChatMessage(
  sessionId: string,
  message: string
): AsyncGenerator<{ type: "chunk" | "done" | "error"; content: string }> {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const response = await fetch(`${API_BASE}/api/chat/sessions/${sessionId}/messages`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    let errorMessage = "Failed to send message";
    try {
      const payload = await response.json();
      errorMessage =
        payload?.message ||
        payload?.error ||
        `Failed to send message (HTTP ${response.status})`;
    } catch {
      errorMessage = `Failed to send message (HTTP ${response.status})`;
    }
    throw new Error(errorMessage);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const data = JSON.parse(line.slice(6));
          yield data;
        } catch {
          // skip malformed lines
        }
      }
    }
  }
}

// ─── Feature 4: Review Config API ──────────────────────────────────────────

export interface ReviewConfigData {
  language?: string | null;
  focusAreas: string[];
  severityThreshold: "low" | "medium" | "high";
  ignorePaths: string[];
  customRules?: string | null;
  autoFix: boolean;
  enabled: boolean;
  issueAnalysis?: boolean;
}

export async function getReviewConfig(repositoryId: string) {
  const res = await fetchApi<ReviewConfigData>(`/api/repositories/${repositoryId}/config`);
  return res.data;
}

export async function updateReviewConfig(repositoryId: string, data: Partial<ReviewConfigData>) {
  const res = await fetchApi<ReviewConfigData>(`/api/repositories/${repositoryId}/config`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.data;
}

// ─── Feature A: Generated Docs API ─────────────────────────────────────────

export type DocType = "readme" | "architecture" | "onboarding";

export interface GeneratedDoc {
  id: string;
  repositoryId: string;
  type: string;
  title: string;
  content: string | null;
  status: string; // "pending" | "completed" | "failed"
  createdAt: string;
  updatedAt: string;
}

export async function getGeneratedDocs(repositoryId: string) {
  const res = await fetchApi<GeneratedDoc[]>(`/api/docs/${repositoryId}`);
  return res.data || [];
}

export async function getGeneratedDoc(repositoryId: string, docType: DocType) {
  const res = await fetchApi<GeneratedDoc>(`/api/docs/${repositoryId}/${docType}`);
  return res.data;
}

export async function generateDoc(repositoryId: string, docType: DocType) {
  const res = await fetchApi<{ queued: boolean }>(`/api/docs/${repositoryId}/generate`, {
    method: "POST",
    body: JSON.stringify({ docType }),
  });
  return res;
}

// ─── Feature B: Issue Analysis API ─────────────────────────────────────────

export interface IssueAnalysis {
  id: string;
  repositoryId: string;
  issueNumber: number;
  issueTitle: string;
  issueUrl: string;
  analysis: string; // JSON string
  postedComment: boolean;
  createdAt: string;
  repository?: { fullName: string };
}

export async function getIssueAnalyses(repositoryId: string) {
  const res = await fetchApi<IssueAnalysis[]>(`/api/issue-analyses/${repositoryId}`);
  return res.data || [];
}

export async function getAllIssueAnalyses() {
  const res = await fetchApi<IssueAnalysis[]>(`/api/issue-analyses/`);
  return res.data || [];
}
