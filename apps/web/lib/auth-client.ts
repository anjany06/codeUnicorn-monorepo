import { createAuthClient } from "better-auth/react";

// Create auth client pointing to Express backend
// Note: polarClient() plugin is intentionally excluded here to avoid
// it calling React's useContext at module-init time which crashes SSR prerendering.
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
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
