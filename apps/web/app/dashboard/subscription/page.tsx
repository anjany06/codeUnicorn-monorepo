"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Zap } from "lucide-react";

const PLAN_FEATURES = {
  free: [
    { name: "Up to 5 repositories", included: true },
    { name: "Up to 5 reviews per repository", included: true },
    { name: "Pull Request reviews", included: true },
    { name: "Limit in AI chat", included: true },
    { name: "No regeneration in Docs", included: true },
  ],
  pro: [
    { name: "Unlimited repositories", included: true },
    { name: "Unlimited reviews", included: true },
    { name: "Pull Request reviews", included: true },
    { name: "No Limit in AI chat", included: true },
    { name: "Regenerate Docs", included: true },
  ],
};

export default function SubscriptionPage() {
  const isPro = false;
  const isActive = false;

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
            <h3 className="font-heading text-lg font-semibold text-foreground">
              Free
            </h3>

            <div className="flex items-end gap-1">
              <span className="font-heading text-4xl font-bold tracking-tight text-foreground">
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
            <h3 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2">
              PRO
              {isPro && isActive && (
                <Badge className="h-5 px-1.5 text-[9px] bg-green-500/10 text-green-600 border-0 uppercase tracking-widest">
                  Active
                </Badge>
              )}
            </h3>

            <div className="flex items-end gap-1">
              <span className="font-heading text-4xl font-bold tracking-tight text-foreground">
                $10
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
            <Button
              disabled
              className="w-full h-10 text-sm font-medium bg-primary/80 hover:bg-primary/80 cursor-not-allowed"
            >
              Coming Soon
              <Zap className="h-3.5 w-3.5 ml-1.5 fill-current" />
            </Button>
          </div>
        </div>
      </div>

      {/* <div className="mt-12 border-t border-border/40 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
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
      </div> */}
    </div>
  );
}
