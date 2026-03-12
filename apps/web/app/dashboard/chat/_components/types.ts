export interface ChatMessage {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  title: string;
  repositoryId: string;
  createdAt: string;
  repository?: { fullName: string };
  lastMessage?: string;
}

export interface ChatRepository {
  id: string;
  fullName?: string;
}
