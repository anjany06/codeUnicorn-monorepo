"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Check,
  X,
  RefreshCw,
  ExternalLink,
  CreditCard,
  Zap,
} from "lucide-react";
import { checkout, customer } from "@/lib/auth-client";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getSubscriptionData, syncSubscriptionStatus } from "@/lib/api";

const PLAN_FEATURES = {
  free: [
    { name: "Up to 5 repositories", included: true },
    { name: "Up to 5 reviews per repository", included: true },
    { name: "Basic code reviews", included: true },
    { name: "Community support", included: true },
    { name: "Advanced analytics", included: false },
    { name: "Priority support", included: false },
  ],
  pro: [
    { name: "Unlimited repositories", included: true },
    { name: "Unlimited reviews", included: true },
    { name: "Advanced code reviews", included: true },
    { name: "Email & Priority support", included: true },
    { name: "Advanced analytics", included: true },
    { name: "Priority support", included: true },
  ],
};

export default function SubscriptionPage() {
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);

  const searchParams = useSearchParams();
  const success = searchParams.get("success");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["subscription-data"],
    queryFn: getSubscriptionData,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (success === "true") {
      const sync = async () => {
        try {
          const result = await syncSubscriptionStatus();

          if (result.success) {
            toast.success("Subscription activated! Welcome to Pro.");
          }

          await refetch();
        } catch (error) {
          console.error("Sync Error:", error);
          toast.error(
            'Could not verify subscription. Please click "Sync Status" manually.',
          );
        }
      };

      sync();
    }
  }, [success, refetch]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 pb-10">
        <div className="space-y-1.5 animate-pulse">
          <div className="h-8 w-48 bg-muted/20 rounded-md"></div>
          <div className="h-4 w-72 bg-muted/10 rounded-md"></div>
        </div>

        <div className="border border-border/50 rounded-xl bg-card h-[400px] animate-pulse"></div>
      </div>
    );
  }

  if (error || !data?.user) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 pb-10">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Plan and Billing
          </h1>

          <p className="text-sm text-destructive">
            Failed to load subscription data or you are not signed in.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const currentTier = data.user.subscriptionTier as "FREE" | "PRO";
  const isPro = currentTier === "PRO";
  const isActive = data.user.subscriptionStatus === "ACTIVE";

  const handleSync = async () => {
    try {
      setSyncLoading(true);

      const result = await syncSubscriptionStatus();

      await refetch();

      if (result.success) {
        toast.success("Subscription status synced successfully");
      } else {
        toast.error(
          "Sync failed: " + (result.message || result.error || "Unknown error"),
        );
      }
    } catch (error) {
      console.error("Sync Error:", error);
      toast.error("Failed to reach the server. Please try again.");
    } finally {
      setSyncLoading(false);
    }
  };

  const handleUpgrade = async () => {
    try {
      setCheckoutLoading(true);

      const origFetch = window.fetch;

      window.fetch = async (...args) => {
        const res = await origFetch(...args);

        if (!res.ok && String(args[0]).includes("checkout")) {
          const clone = res.clone();
          const body = await clone.text();
          console.error("Checkout raw error:", res.status, body);
        }

        return res;
      };

      await checkout({
        slug: "codeUnicorn-new-dev",
      });

      window.fetch = origFetch;
    } catch (error) {
      console.error("Checkout Error:", error);
      toast.error("Failed to initiate checkout. Please try again.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setPortalLoading(true);
      await customer.portal();
    } catch (error) {
      console.error("Portal Error:", error);
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Plan and Billing
          </h1>

          <p className="text-sm text-muted-foreground max-w-md">
            Manage your subscription tier and payment methods.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={syncLoading}
            className="h-8 text-xs bg-background"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 mr-1.5 ${
                syncLoading ? "animate-spin" : ""
              }`}
            />
            Sync Status
          </Button>

          {(isPro || isActive) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleManageSubscription}
              disabled={portalLoading}
              className="h-8 text-xs bg-background"
            >
              <CreditCard className="h-3.5 w-3.5 mr-1.5" />
              Manage Billing
            </Button>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* FREE PLAN */}

        <div
          className={`relative border ${
            !isPro
              ? "border-primary shadow-sm bg-muted/5"
              : "border-border/60 bg-card hover:border-border hover:shadow-sm"
          } rounded-xl p-6 flex flex-col transition-all duration-200 hover:-translate-y-[2px]`}
        >
          {!isPro && (
            <div className="absolute top-0 right-6 transform -translate-y-1/2">
              <span className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                Current Plan
              </span>
            </div>
          )}

          <div className="space-y-2 mb-6">
            <h3 className="text-lg font-semibold text-foreground">Developer</h3>

            <div className="flex items-end gap-1">
              <span className="text-4xl font-bold tracking-tight text-foreground">
                $0
              </span>

              <span className="text-sm text-muted-foreground mb-1">/month</span>
            </div>

            <p className="text-sm text-muted-foreground">
              Perfect for individuals or getting started with AI reviews.
            </p>
          </div>

          <div className="space-y-3 flex-1 mt-2">
            {PLAN_FEATURES.free.map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                {feature.included ? (
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                ) : (
                  <X className="h-4 w-4 text-muted-foreground/30 shrink-0" />
                )}

                <span
                  className={
                    feature.included
                      ? "text-foreground"
                      : "text-muted-foreground/50"
                  }
                >
                  {feature.name}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-border/40 mt-6 pt-6">
            <Button
              variant="outline"
              className="w-full h-10 text-sm pointer-events-none opacity-50"
            >
              {isPro ? "Included in Pro" : "Active Plan"}
            </Button>
          </div>
        </div>

        {/* PRO PLAN */}

        <div
          className={`relative border ${
            isPro
              ? "border-primary shadow-md bg-muted/10"
              : "border-border/60 bg-card hover:border-border hover:shadow-sm"
          } rounded-xl p-6 flex flex-col transition-all duration-200 hover:-translate-y-[2px]`}
        >
          {!isPro && (
            <div className="absolute left-6 -top-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-primary text-primary-foreground px-3 py-1 rounded-full shadow-sm">
                Most Popular
              </span>
            </div>
          )}

          {isPro && (
            <div className="absolute top-0 right-6 transform -translate-y-1/2">
              <div className="flex items-center gap-1.5 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                <Zap className="h-3 w-3 fill-current" />
                Current Plan
              </div>
            </div>
          )}

          <div className="space-y-2 mb-6">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              Team
              {isPro && isActive && (
                <Badge className="h-5 px-1.5 text-[9px] bg-green-500/10 text-green-600 border-0 uppercase tracking-widest">
                  Active
                </Badge>
              )}
            </h3>

            <div className="flex items-end gap-1">
              <span className="text-4xl font-bold tracking-tight text-foreground">
                $15
              </span>

              <span className="text-sm text-muted-foreground mb-1">/month</span>
            </div>

            <p className="text-sm text-muted-foreground">
              Unlimited power for shipping high-quality code.
            </p>
          </div>

          <div className="space-y-3 flex-1 mt-2">
            {PLAN_FEATURES.pro.map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <Check className="h-4 w-4 text-primary shrink-0" />

                <span className="text-foreground">{feature.name}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-border/40 mt-6 pt-6">
            {isPro ? (
              <Button
                onClick={handleManageSubscription}
                disabled={portalLoading}
                className="w-full h-10 text-sm font-medium bg-primary"
              >
                {portalLoading ? "Redirecting..." : "Manage Billing"}
                <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            ) : (
              <Button
                onClick={handleUpgrade}
                disabled={checkoutLoading || syncLoading}
                className="w-full h-10 text-sm font-medium bg-primary hover:bg-primary/90 shadow-sm"
              >
                {checkoutLoading ? "Preparing Checkout..." : "Upgrade to Team"}
                <Zap className="h-3.5 w-3.5 ml-1.5 fill-current" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {!isPro && (
        <div className="mt-12 border-t border-border/40 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-sm font-medium text-foreground">
              Need more repositories or enterprise support?
            </h4>

            <p className="text-sm text-muted-foreground">
              Our enterprise plans offer custom SLAs and dedicated support.
            </p>
          </div>

          <Button variant="outline" size="sm" className="h-9 text-sm">
            Contact Sales
          </Button>
        </div>
      )}
    </div>
  );
}
