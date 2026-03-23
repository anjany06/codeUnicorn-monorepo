import React from "react";
import { ArrowRight } from "lucide-react";

export function TicketPricing() {
  return (
    <section id="pricing" className="py-40 px-6 max-w-7xl mx-auto">
      <div className="mb-20 text-center">
        <h2 className="font-mono text-sm tracking-widest text-primary mb-4 uppercase">Subscriptions</h2>
        <h2 className="text-4xl md:text-5xl font-light">Flexible <span className="font-serif italic text-white/60">Plans</span></h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <PricingCard
          title="Free"
          price="$0"
          features={[
            "Up to 5 repositories",
            "Up to 5 reviews per repository",
            "Pull Request reviews",
            "Up to 10 AI chat messages / 8 hours",
            "No regeneration in Docs"
          ]}
        />
        <PricingCard
          title="Pro"
          price="$10/mo"
          features={[
            "Unlimited repositories",
            "Unlimited reviews",
            "Pull Request reviews",
            "Unlimited AI chat messages",
            "Regenerate Docs"
          ]}
          highlight
          buttonText="Coming Soon"
        />
        <PricingCard
          title="Enterprise"
          price="Custom"
          features={[
            "Unlimited Seats",
            "Custom Integrations",
            "Advanced Analytics",
            "Dedicated Support"
          ]}
        />
      </div>
    </section>
  );
}

function PricingCard({ title, price, features, highlight = false, buttonText = "Deploy Now" }: { title: string, price: string, features: string[], highlight?: boolean, buttonText?: string }) {
  // Torn edge effect using mask image concept applied via css or svg pattern
  return (
    <div className={`relative flex flex-col ${highlight ? 'scale-105 z-10' : 'scale-100 opacity-90'} transition-transform`}>
      <div className={`bg-white/5 border-l border-r ${highlight ? 'border-primary' : 'border-white/10'} p-8 min-h-[400px] flex flex-col mask-ticket`}>

        <div className="pt-8">
          <h3 className="font-mono text-sm tracking-widest text-primary uppercase mb-2">{title}</h3>
          <div className="text-4xl font-light mb-8">{price}</div>

          <div className="w-full border-t-2 border-dashed border-primary/30 mb-8" />

          <ul className="space-y-4">
            {features.map((f, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-foreground/70">
                <ArrowRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {highlight && (
          <button className="mt-6 w-full py-2 bg-primary text-background font-mono text-sm uppercase tracking-widest font-bold hover:bg-primary/90 transition-colors">
            {buttonText}
          </button>
        )}

      </div>
    </div>
  );
}
