"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { getSubscriptionData } from "@/lib/api";
import { UsageOverview } from "./_components/usage-overview";
import { PlanCard } from "./_components/plan-card";

const FREE_REPOSITORY_LIMIT = 5;
const FREE_REVIEWS_PER_REPOSITORY_LIMIT = 5;
const FREE_CHAT_MESSAGE_LIMIT = 10;

const PLAN_FEATURES = {
  free: [
    { name: "Up to 5 repositories", included: true },
    { name: "Up to 5 reviews per repository", included: true },
    { name: "Pull Request reviews", included: true },
    { name: "Up to 10 AI chat messages / 8 hours", included: true },
    { name: "No regeneration in Docs", included: true },
  ],
  pro: [
    { name: "Unlimited repositories", included: true },
    { name: "Unlimited reviews", included: true },
    { name: "Pull Request reviews", included: true },
    { name: "Unlimited AI chat messages", included: true },
    { name: "Regenerate Docs", included: true },
  ],
};

export default function SubscriptionPage() {
  const { data: subscriptionData, isLoading } = useQuery({
    queryKey: ["subscription-data"],
    queryFn: getSubscriptionData,
    refetchOnWindowFocus: false,
  });

  const isPro = subscriptionData?.user?.subscriptionTier === "PRO";
  const isActive = subscriptionData?.user?.subscriptionStatus === "ACTIVE";
  const limits = subscriptionData?.limits;

  const repositoriesCurrent = limits?.repositories.current ?? 0;
  const repositoriesLimit =
    limits?.repositories.limit ?? (isPro ? null : FREE_REPOSITORY_LIMIT);

  const reviewEntries = Object.values(limits?.reviews ?? {});
  const reviewsCurrent =
    reviewEntries.length > 0
      ? Math.max(...reviewEntries.map((item) => item.current))
      : 0;
  const reviewsLimit =
    reviewEntries.find((item) => item.limit !== null)?.limit ??
    (isPro ? null : FREE_REVIEWS_PER_REPOSITORY_LIMIT);

  const chatCurrent = limits?.chatMessages.current ?? 0;
  const chatLimit =
    limits?.chatMessages.limit ?? (isPro ? null : FREE_CHAT_MESSAGE_LIMIT);
  const chatWindowHours = limits?.chatMessages.windowHours ?? 8;

  const usageItems = [
    {
      label: "Connected repositories",
      current: repositoriesCurrent,
      limit: repositoriesLimit,
      hint: isPro ? "Unlimited repositories on Pro" : "Repository connections used",
    },
    {
      label: "AI reviews",
      current: reviewsCurrent,
      limit: reviewsLimit,
      hint: isPro
        ? "Unlimited reviews on Pro"
        : reviewEntries.length === 0
          ? "Per repository limit (no repository connected yet)"
          : "Per repository usage (highest used repository)",
    },
    {
      label: "AI chat messages",
      current: chatCurrent,
      limit: chatLimit,
      hint: isPro
        ? "Unlimited chat on Pro"
        : `Rolling ${chatWindowHours}-hour window`,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
            Plan and Billing
          </h1>
          <p className="text-sm text-muted-foreground max-w-md">
            Manage your subscription tier and payment methods.
          </p>
        </div>

        <Badge variant="outline" className="h-8 px-3 text-xs">
          Billing coming soon
        </Badge>
      </div>

      <UsageOverview isLoading={isLoading} isPro={isPro} usageItems={usageItems} />

      <div className="grid md:grid-cols-2 gap-6">
        <PlanCard
          name="Free"
          price="$0"
          description="Perfect for individuals or getting started with AI reviews."
          isCurrent={!isPro}
          isPro={isPro}
          isActive={isActive}
          features={PLAN_FEATURES.free}
        />

        <PlanCard
          name="PRO"
          price="$10"
          description="Unlimited power for shipping high-quality code."
          isCurrent={isPro}
          isPro={isPro}
          isActive={isActive}
          features={PLAN_FEATURES.pro}
        />
      </div>
    </div>
  );
}
