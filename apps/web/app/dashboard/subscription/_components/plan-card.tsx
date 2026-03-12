import { Check, X, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type PlanFeature = {
  name: string;
  included: boolean;
};

type PlanCardProps = {
  name: "Free" | "PRO";
  price: string;
  description: string;
  isCurrent: boolean;
  isPro: boolean;
  isActive: boolean;
  features: PlanFeature[];
};

export function PlanCard({
  name,
  price,
  description,
  isCurrent,
  isPro,
  isActive,
  features,
}: PlanCardProps) {
  const isFreePlan = name === "Free";

  return (
    <div
      className={`relative border ${
        isCurrent
          ? isFreePlan
            ? "border-primary shadow-sm bg-muted/5"
            : "border-primary shadow-md bg-muted/10"
          : "border-border/60 bg-card hover:border-border hover:shadow-sm"
      } rounded-xl p-6 flex flex-col transition-all duration-200 hover:-translate-y-[2px]`}
    >
      {isFreePlan && isCurrent && (
        <div className="absolute top-0 right-6 transform -translate-y-1/2">
          <span className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-full">
            Current Plan
          </span>
        </div>
      )}

      {!isFreePlan && !isCurrent && (
        <div className="absolute left-6 -top-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider bg-primary text-primary-foreground px-3 py-1 rounded-full shadow-sm">
            Most Popular
          </span>
        </div>
      )}

      {!isFreePlan && isCurrent && (
        <div className="absolute top-0 right-6 transform -translate-y-1/2">
          <div className="flex items-center gap-1.5 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-full">
            <Zap className="h-3 w-3 fill-current" />
            Current Plan
          </div>
        </div>
      )}

      <div className="space-y-2 mb-6">
        <h3 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2">
          {name}
          {!isFreePlan && isPro && isActive && (
            <Badge className="h-5 px-1.5 text-[9px] bg-green-500/10 text-green-600 border-0 uppercase tracking-widest">
              Active
            </Badge>
          )}
        </h3>

        <div className="flex items-end gap-1">
          <span className="font-heading text-4xl font-bold tracking-tight text-foreground">
            {price}
          </span>
          <span className="text-sm text-muted-foreground mb-1">/month</span>
        </div>

        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="space-y-3 flex-1 mt-2">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center gap-3 text-sm">
            {feature.included ? (
              <Check
                className={`h-4 w-4 shrink-0 ${isFreePlan ? "text-green-500" : "text-primary"}`}
              />
            ) : (
              <X className="h-4 w-4 text-muted-foreground/30 shrink-0" />
            )}
            <span
              className={
                feature.included ? "text-foreground" : "text-muted-foreground/50"
              }
            >
              {feature.name}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-border/40 mt-6 pt-6">
        {isFreePlan ? (
          <Button
            variant="outline"
            className="w-full h-10 text-sm pointer-events-none opacity-50"
          >
            {isPro ? "Included in Pro" : "Active Plan"}
          </Button>
        ) : (
          <Button
            disabled
            className="w-full h-10 text-sm font-medium bg-primary/80 hover:bg-primary/80 cursor-not-allowed"
          >
            Coming Soon
            <Zap className="h-3.5 w-3.5 ml-1.5 fill-current" />
          </Button>
        )}
      </div>
    </div>
  );
}
