import { createAuthClient } from "better-auth/react";

// Create auth client pointing to Express backend
export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:4000",
  // This is the base path for auth endpoints
  basePath: "/api/auth",
});

// Export commonly used functions
export const {
  signIn,
  signOut,
  signUp,
  useSession,
  getSession,
} = authClient;