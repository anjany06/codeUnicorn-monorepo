import { createAuthClient } from "better-auth/react";
import { polarClient } from "@polar-sh/better-auth/client";



// Create auth client pointing to Express backend
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
  // This is the base path for auth endpoints
  basePath: "/api/auth",
  plugins: [polarClient()],
});

// Export commonly used functions
export const {
  signIn,
  signOut,
  signUp,
  useSession,
  getSession,
  customer,
  checkout
  
} = authClient;