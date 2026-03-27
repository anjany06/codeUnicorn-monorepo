import React from "react";
import { GitPullRequest, FileCode, Network, Layers } from "lucide-react";
import { GlowCard } from "@/components/ui/spotlight-card";

export function Features() {
  return (
    <section id="features" className="py-40 px-6 md:px-20 bg-[#050505]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20 text-center">
          <h2 className="text-4xl md:text-5xl font-light mb-6">Unified <span className="text-primary">Features</span></h2>
          <p className="text-foreground/50">Core capacities integrating advanced features and actionable insights.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 auto-rows-[300px]">
          {/* Card 1 */}
          <BentoCard
            className="md:col-span-2 relative group"
            title="Intelligent PR Reviews."
            description="Analyzes pull requests using context-aware retrieval to catch issues and suggest improvements."
            icon={<GitPullRequest className="w-8 h-8 text-primary" />}
          />

          {/* Card 2 */}
          <BentoCard
            className="md:col-span-1"
            title="AI-Generated Documentation."
            description="Create README files, onboarding guides, and system design docs based on actual codebase."
            icon={<FileCode className="w-8 h-8 text-primary" />}
          />

          {/* Card 3 */}
          <BentoCard
            className="md:col-span-1 h-full"
            title="Context-aware Codebase Chat."
            description="Ask questions about your repository and get context-aware answers instantly based on Indexed codebase."
            icon={<Network className="w-8 h-8 text-primary" />}
          />

          {/* Card 4 */}
          <BentoCard
            className="md:col-span-2 h-full"
            title="AI Issue Analysis."
            description="System analyzes webhooks events to suggest relevant files and labels for your issues."
            icon={<Layers className="w-8 h-8 text-primary" />}
          />

        </div>
      </div>
    </section>
  );
}

function BentoCard({ title, description, icon, className = "", children }: { title: string, description?: string, icon: React.ReactNode, className?: string, children?: React.ReactNode }) {
  return (
    <GlowCard customSize glowColor="green" className={`group relative overflow-hidden transition-all duration-500 ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0" />
      <div className="relative z-10 h-full flex flex-col justify-between">
        <div className="p-3 rounded-lg bg-white/5 w-fit border border-white/10">
          {icon}
        </div>
        <div className="mt-8">
          <h3 className="text-2xl font-light">{title}</h3>
          {description && <p className="text-foreground/60 text-sm mt-4 max-w-full">{description}</p>}
        </div>
      </div>
      {children}
    </GlowCard>
  );
}
