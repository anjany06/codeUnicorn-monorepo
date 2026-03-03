import { prisma } from "@codeunicorn/database";
import { Polar } from "@polar-sh/sdk";

export type SubscriptionTier = "FREE" | "PRO";
export type SubscriptionStatus = "ACTIVE" | "CANCELLED" | "EXPIRED";

export interface UserLimits {
  tier: SubscriptionTier;
  repositories: {
    current: number;
    limit: number | null;
    canAdd: boolean;
  };
  reviews: {
    [repositoryId: string]: {
      current: number;
      limit: number | null;
      canAdd: boolean;
    };
  };
}

const TIER_LIMITS = {
  FREE: {
    repositories: 5,
    reviewsPerRepo: 5,
  },
  PRO: {
    repositories: null,
    reviewsPerRepo: null,
  },
} as const;

const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  server: (process.env.POLAR_SANDBOX === "true" ? "sandbox" : "production") as "sandbox" | "production",
});

// ─── Tier helpers ────────────────────────────────────────

export async function getUserTier(userId: string): Promise<SubscriptionTier> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true },
  });
  return (user?.subscriptionTier as SubscriptionTier) || "FREE";
}

async function getUserUsage(userId: string) {
  let usage = await prisma.userUsage.findUnique({
    where: { userId },
  });

  if (!usage) {
    usage = await prisma.userUsage.create({
      data: { userId, repositoryCount: 0, reviewCounts: {} },
    });
  }
  return usage;
}

// ─── Limit checks ───────────────────────────────────────

export async function canConnectRepository(userId: string): Promise<boolean> {
  const tier = await getUserTier(userId);
  if (tier === "PRO") return true;

  const usage = await getUserUsage(userId);
  return usage.repositoryCount < TIER_LIMITS.FREE.repositories;
}

export async function canCreateReview(userId: string, repositoryId: string): Promise<boolean> {
  const tier = await getUserTier(userId);
  if (tier === "PRO") return true;

  const usage = await getUserUsage(userId);
  const reviewCounts = usage.reviewCounts as Record<string, number>;
  const currentCount = reviewCounts[repositoryId] || 0;
  return currentCount < TIER_LIMITS.FREE.reviewsPerRepo;
}

// ─── Usage tracking ─────────────────────────────────────

export async function incrementRepositoryCount(userId: string): Promise<void> {
  await prisma.userUsage.upsert({
    where: { userId },
    create: { userId, repositoryCount: 1, reviewCounts: {} },
    update: { repositoryCount: { increment: 1 } },
  });
}

export async function decrementRepositoryCount(userId: string): Promise<void> {
  const usage = await getUserUsage(userId);
  await prisma.userUsage.update({
    where: { userId },
    data: { repositoryCount: Math.max(0, usage.repositoryCount - 1) },
  });
}

export async function incrementReviewCount(userId: string, repositoryId: string): Promise<void> {
  const usage = await getUserUsage(userId);
  const reviewCounts = usage.reviewCounts as Record<string, number>;
  reviewCounts[repositoryId] = (reviewCounts[repositoryId] || 0) + 1;

  await prisma.userUsage.update({
    where: { userId },
    data: { reviewCounts },
  });
}

// ─── Remaining limits ───────────────────────────────────

export async function getRemainingLimits(userId: string): Promise<UserLimits> {
  const tier = await getUserTier(userId);
  const usage = await getUserUsage(userId);
  const reviewCounts = usage.reviewCounts as Record<string, number>;

  const limits: UserLimits = {
    tier,
    repositories: {
      current: usage.repositoryCount,
      limit: tier === "PRO" ? null : TIER_LIMITS.FREE.repositories,
      canAdd: tier === "PRO" || usage.repositoryCount < TIER_LIMITS.FREE.repositories,
    },
    reviews: {},
  };

  const repositories = await prisma.repository.findMany({
    where: { userId },
    select: { id: true },
  });

  for (const repo of repositories) {
    const currentCount = reviewCounts[repo.id] || 0;
    limits.reviews[repo.id] = {
      current: currentCount,
      limit: tier === "PRO" ? null : TIER_LIMITS.FREE.reviewsPerRepo,
      canAdd: tier === "PRO" || currentCount < TIER_LIMITS.FREE.reviewsPerRepo,
    };
  }

  return limits;
}

// ─── Tier updates ───────────────────────────────────────

export async function updateUserTier(
  userId: string,
  tier: SubscriptionTier,
  status: SubscriptionStatus,
  polarSubscriptionId?: string,
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionTier: tier,
      subscriptionStatus: status,
    },
  });
}

export async function updatePolarCustomerId(userId: string, polarCustomerId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { polarCustomerId },
  });
}

// ─── Subscription data (for the API) ────────────────────

export async function getSubscriptionData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return { user: null, limits: null };
  }

  const limits = await getRemainingLimits(user.id);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      subscriptionTier: user.subscriptionTier || "FREE",
      subscriptionStatus: user.subscriptionStatus || null,
      polarCustomerId: user.polarCustomerId || null,
      polarSubscriptionId: user.polarSubscriptionId || null,
    },
    limits,
  };
}

// ─── Sync with Polar ────────────────────────────────────

export async function syncSubscriptionStatus(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return { success: false, message: "User not found" };
  }

  try {
    // The @polar-sh/better-auth plugin sets externalId = user.id on the Polar
    // customer at signup, so we look up subscriptions by externalCustomerId
    // — no need for polarCustomerId to be stored in the DB.
    const result = await polarClient.subscriptions.list({
      externalCustomerId: user.id,
    });

    const subscriptions = result.result?.items || [];
    const activeSub = subscriptions.find((sub: any) => sub.status === "active");
    const latestSub = subscriptions[0];

    if (activeSub) {
      // Also persist the customer/subscription IDs now that we have them
      await prisma.user.update({
        where: { id: user.id },
        data: {
          polarCustomerId: activeSub.customerId ?? user.polarCustomerId,
          polarSubscriptionId: activeSub.id,
        },
      });
      await updateUserTier(user.id, "PRO", "ACTIVE", activeSub.id);
      return { success: true, status: "ACTIVE" };
    } else if (latestSub) {
      const status = latestSub.status === "canceled" ? "CANCELLED" : "EXPIRED";
      await updateUserTier(user.id, "FREE", status as SubscriptionStatus, latestSub.id);
      return { success: true, status };
    }

    return { success: true, status: "NO_SUBSCRIPTION" };
  } catch (error) {
    console.error("Failed to sync subscription:", error);
    return { success: false, error: "Failed to sync with Polar" };
  }
}
