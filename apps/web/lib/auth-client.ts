import { createAuthClient } from "better-auth/react";

// Create auth client that goes through the Next.js rewrite proxy.
// By NOT setting baseURL, the client defaults to the current origin,
// so all auth requests go to VERCEL_URL/api/auth/* → proxied to the backend.
// This ensures cookies are set on the Vercel domain (same-origin),
// which fixes SSR session checks that can't access cross-domain cookies.
export const authClient = createAuthClient({
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
