import { createAuthClient } from "better-auth/react";

// Create auth client pointing to Express backend
// Note: polarClient() plugin is intentionally excluded here to avoid
// it calling React's useContext at module-init time which crashes SSR prerendering.
export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
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
