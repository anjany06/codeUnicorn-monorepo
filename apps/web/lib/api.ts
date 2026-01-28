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

export async function disconnectRepository(id: string) {
  return fetchApi(`/api/repositories/${id}`, {
    method: "DELETE",
  });
}