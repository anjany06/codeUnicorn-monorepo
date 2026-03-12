export interface Repository {
  id: number;
  name: string;
  owner: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  topics: string[];
  isConnected: boolean;
}

export interface ConnectedRepository {
  id: string;
  githubId: string;
  indexedAt?: string | null;
}
