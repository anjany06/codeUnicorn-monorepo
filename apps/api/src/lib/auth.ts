import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@codeunicorn/database";
import { Polar } from "@polar-sh/sdk";
import { polar, checkout, portal, usage, webhooks } from "@polar-sh/better-auth";
import { updatePolarCustomerId, updateUserTier } from "../services/subscription.service";

const polarSdk = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  server: "sandbox",
});

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
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
  
  // Trusted origins for CSRF protection
  trustedOrigins: [
    process.env.FRONTEND_URL || "http://localhost:3000",
  ],
  
  // Advanced options
  advanced: {
    crossSubDomainCookies: {
      enabled: false, 
    },
    defaultCookieAttributes: {
      sameSite: "lax",   // "lax" works because auth goes through the Vercel proxy (same origin)
      secure: true,      // Always use secure cookies in production
      httpOnly: true,
    },
  },

  plugins: [
    polar({
      client: polarSdk,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          successUrl: `${process.env.FRONTEND_URL}/dashboard/subscription?success=true`,
          authenticatedUsersOnly: true,
          products:[
            {
              slug: "codeUnicorn-new-dev",
              productId: process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID!,
            }
          ]
        }),
        portal({
          returnUrl: process.env.FRONTEND_URL || "http://localhost:3000/dashboard",
        }),
        usage(),
        webhooks({
          secret: process.env.POLAR_WEBHOOK_SECRET!,
          onSubscriptionActive: async (payload) => {
            const customerId = payload.data.customerId;
            const user = await prisma.user.findUnique({
              where: { polarCustomerId: customerId },
            });
            if (user) {
              await updateUserTier(user.id, "PRO", "ACTIVE", payload.data.id);
            }
          },
          onSubscriptionCanceled: async (payload) => {
            const customerId = payload.data.customerId;
            const user = await prisma.user.findUnique({
              where: { polarCustomerId: customerId },
            });
            if (user) {
              await updateUserTier(user.id, user.subscriptionTier as any, "CANCELLED");
            }
          },
          onSubscriptionRevoked: async (payload) => {
            const customerId = payload.data.customerId;
            const user = await prisma.user.findUnique({
              where: { polarCustomerId: customerId },
            });
            if (user) {
              await updateUserTier(user.id, "FREE", "EXPIRED");
            }
          },
          onOrderPaid: async () => {},
          onCustomerCreated: async (payload) => {
            const user = await prisma.user.findUnique({
              where: { email: payload.data.email },
            });
            if (user) {
              await updatePolarCustomerId(user.id, payload.data.id);
            }
          },
        }),
      ],
    }),
  ],
});

// Export types for use in middleware
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;