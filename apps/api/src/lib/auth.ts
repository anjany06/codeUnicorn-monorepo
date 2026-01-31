import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@codeunicorn/database";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  
  // Email & Password 
  emailAndPassword: {
    enabled: false, // Set true if you want email/password login
  },
  
  // Social Providers
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      // Important: Request these scopes for your app
      scope: ["repo"], // bcoz we want to access the repo of currently logged in user's 
    },
  },
  
  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes cache
    },
  },
  
  // Important for cross-origin requests
  trustedOrigins: [
    process.env.FRONTEND_URL || "http://localhost:3000",
  ],
  
  // Advanced options
  advanced: {
    crossSubDomainCookies: {
      enabled: false, // Set true if using subdomains
    },
    defaultCookieAttributes: {
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    },
  },
});

// Export types for use in middleware
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;