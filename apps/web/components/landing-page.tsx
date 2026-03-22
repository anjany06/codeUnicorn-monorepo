"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ChevronDown, Database, FileCode, Network, Terminal as TerminalIcon, GitPullRequest, Code2, Layers, Cpu, Code, ArrowRight, Activity, Github, User2, GitCommit, MousePointer2 } from "lucide-react";
import { EtherealShadow } from "./ui/etheral-shadow";
import { GlowCard } from "./ui/spotlight-card";

export function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Setup smooth scroll feeling natively as instructed by generic lenis usage
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full bg-background text-foreground overflow-x-hidden selection:bg-primary selection:text-background font-sans">
      <Navbar />
      <Hero />
      <Manifesto />
      <Features />
      <Pulse />
      <PRAgent />
      <TechnicalProof />
      <TicketPricing />
      <FAQ />
      <Footer />
    </div>
  );
}

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full p-4 md:p-6 z-50 flex items-center justify-between bg-transparent backdrop-blur-lg md:backdrop-blur-none border-b border-white/5 md:border-transparent text-foreground">
      <div className="flex items-center gap-2">
        <img src="/codeUnicorn-logo.png" alt="CodeUnicorn Logo" className="w-10 h-8 md:w-12 md:h-10 object-contain" />
        <span className="font-heading text-sm tracking-widest uppercase hidden md:inline-block">CodeUnicorn</span>
      </div>
      <div className="flex gap-4 md:gap-6 items-center">
        <a href="#features" className="text-sm font-mono hover:text-emerald-500 transition-colors hidden md:block">Features</a>
        <a href="#pricing" className="text-sm font-mono hover:text-emerald-500 transition-colors hidden md:block">Pricing</a>
        <a href="/login" className="text-xs md:text-sm font-mono hover:text-emerald-500 transition-colors ml-2 md:ml-4">Log In</a>
        <a href="/login" className="text-xs md:text-sm font-mono border border-primary px-3 py-1.5 md:px-4 md:py-2 bg-emerald-600 hover:bg-transparent transition-all rounded-sm uppercase tracking-wider">Get Started</a>
      </div>
    </nav>
  );
}

function Hero() {
  const { scrollY } = useScroll();
  const scaleDown = useTransform(scrollY, [0, 500], [1, 0.95]);
  const yParallax = useTransform(scrollY, [0, 500], [0, 100]);
  const clipPathReveal = useTransform(scrollY, [0, 300], ["inset(10% 10% 10% 10%)", "inset(0% 0% 0% 0%)"]);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-20 px-4">
      <EtherealShadow
        color="rgba(16, 185, 129, 0.6)"
        animation={{ scale: 100, speed: 90 }}
        noise={{ opacity: 1, scale: 1.2 }}
        className="z-0"
      />
      <motion.div style={{ scale: scaleDown, y: yParallax }} className="text-center z-10 max-w-4xl mx-auto flex flex-col items-center relative">
        <div className="inline-flex items-center gap-2 md:gap-3 px-3 py-1.5 md:px-5 md:py-2 rounded-full border border-white/20 bg-white/10 mb-8 text-[10px] md:text-xs font-mono text-white backdrop-blur-md shadow-[0_4px_14px_0_rgba(255,255,255,0.1)] hover:bg-white/20 hover:border-white/30 transition-all duration-300">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
            </span>
            <span className="font-light text-white drop-shadow-md uppercase">Meet CodeUnicorn</span>
          </div>
        </div>
        <h1 className="text-6xl md:text-8xl font-normal leading-tight tracking-tight mb-8">
          GitHub Intelligence <br />
          <span className="font-serif italic text-emerald-600">Platform.</span>
        </h1>
        <p className="text-xl md:text-2xl text-foreground/70 max-w-3xl font-light mb-20">
          Enhance GitHub workflows by combining intelligent PR reviews, codebase understanding, and developer analytics into one unified tool.
        </p>
      </motion.div>

      <motion.div
        style={{ clipPath: clipPathReveal, y: useTransform(scrollY, [0, 500], [50, -50]) }}
        className="w-full max-w-6xl mt-24 relative z-20 hidden md:block"
      >
        <div className="relative aspect-video rounded-xl bg-card border border-primary overflow-hidden shadow-[0_0_50px_-12px_var(--primary)] shadow-primary/20">
          {/* Device Frame Header */}
          <div className="absolute top-0 w-full h-8 border-b border-primary/20 bg-background/50 flex items-center px-4 gap-2 backdrop-blur-md">
            <div className="w-2 h-2 rounded-full bg-primary/20" />
            <div className="w-2 h-2 rounded-full bg-primary/40" />
            <div className="w-2 h-2 rounded-full bg-primary/60" />
            <div className="mx-auto font-mono text-[10px] text-primary/50">dashboard.codeunicorn.app</div>
          </div>
          {/* Dashboard Visual */}
          <div className="w-full h-full pt-8 bg-background flex flex-col relative overflow-hidden">
            <DashboardVisual />
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function Manifesto() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start center", "end center"]
  });

  const widthTransform = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const blurTransform = useTransform(scrollYProgress, [0, 1], ["8px", "0px"]);

  return (
    <section ref={ref} className="relative min-h-[70vh] flex items-center justify-center px-4 border-y border-white/5 py-32 bg-background">
      {/* Background Parallax text */}
      <h2 className="absolute text-[15vw] font-serif italic text-white/5 whitespace-nowrap opacity-20 pointer-events-none select-none">
        Intelligence
      </h2>

      <div className="relative z-10 text-center max-w-5xl mx-auto">
        <h2 className="text-5xl md:text-7xl font-sans tracking-tighter text-muted-foreground relative inline-block">
          Not Grep.
          <br className="md:hidden" />
          <span className="relative">
            <span className="opacity-0">Intelligence.</span>
            <motion.span
              className="absolute left-0 top-0 overflow-hidden whitespace-nowrap text-foreground"
              style={{ width: widthTransform, filter: blurTransform }}
            >
              Intelligence.
            </motion.span>
          </span>
        </h2>
      </div>
    </section>
  );
}

function Pulse() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const xTransform = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const xTransformReverse = useTransform(scrollYProgress, [0, 1], ["-30%", "0%"]);

  const renderPulseRow = (transform: any, yOffset: number) => (
    <motion.div style={{ x: transform }} className="flex gap-2 whitespace-nowrap min-w-max pb-2">
      {Array.from({ length: 150 }).map((_, i) => {
        // Deterministic pseudo-random generation to fix hydration mismatch
        const x = Math.sin(i * 12.9898 + (yOffset * 78.233)) * 43758.5453;
        const intensity = x - Math.floor(x);
        const isActive = intensity > 0.6;
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: ((i + yOffset) % 20) * 0.02 }}
            key={i}
            className={`w-6 h-6 rounded-[2px] ${isActive ? 'bg-primary' : 'bg-primary/5 border border-primary/10'}`}
            style={{
              opacity: isActive ? Number((0.4 + (intensity * 0.6)).toFixed(2)) : 0.5,
              boxShadow: isActive ? `0 0 ${(intensity * 15).toFixed(1)}px var(--primary)` : 'none'
            }}
          />
        );
      })}
    </motion.div>
  );

  return (
    <section ref={ref} className="relative py-40 overflow-hidden bg-background">
      <div className="px-6 md:px-20 mb-16 max-w-7xl mx-auto">
        <h3 className="font-mono text-sm tracking-widest text-primary mb-4 uppercase">Developer Analytics</h3>
        <h2 className="text-4xl md:text-5xl font-light">Track Activity & Growth. <span className="font-serif italic text-white/50">Quantified.</span></h2>
        <p className="text-foreground/50 max-w-2xl mt-4 text-lg">
          Detailed insights into your commits, pull requests, AI reviews, and contribution graphs with customizable themes. Discover streaks, monthly trends, and performance patterns.
        </p>
      </div>

      <div className="w-full pl-6 md:pl-20 flex flex-col overflow-hidden">
        {renderPulseRow(xTransform, 0)}
        {renderPulseRow(xTransformReverse, 5)}
        {renderPulseRow(xTransform, 10)}
        {renderPulseRow(xTransformReverse, 15)}
      </div>
    </section>
  );
}

type LogType = "info" | "success" | "error";

type HowItWorksStep = {
  icon: any;
  label: string;
  title: string;
  desc: string;
  logs: {
    delay: number;
    type: LogType;
    text: string;
  }[];
};

const howItWorksSteps: HowItWorksStep[] = [
  {
    icon: Github,
    label: "Continue with GitHub",
    title: "Seamless Authentication.",
    desc: "Sign in effortlessly using your GitHub account to give CodeUnicorn secure access without complex setup.",
    logs: [
      { delay: 1, type: "info", text: "[AUTH] Initiating OAuth flow..." },
      { delay: 1.5, type: "info", text: "[AUTH] Exchanging auth code for tokens..." },
      { delay: 2.5, type: "success", text: "> Profile synced. Access granted." },
    ]
  },
  {
    icon: Database,
    label: "Connect Repo",
    title: "Repository Indexing.",
    desc: "Link any repository to be fully indexed. We parse your codebase architecture and map out dependencies using advanced embeddings.",
    logs: [
      { delay: 1, type: "info", text: "[WEBHOOK] Repository connection established." },
      { delay: 1.5, type: "info", text: "[INDEX] Parsing AST and embedding logic..." },
      { delay: 2.5, type: "success", text: "> Vector map generated. Codebase indexed." },
    ]
  },
  {
    icon: GitPullRequest,
    label: "Create Pull Request",
    title: "Automated Triggers.",
    desc: "Simply open a pull request as you normally would. CodeUnicorn automatically catches the webhook and begins contextual analysis.",
    logs: [
      { delay: 1, type: "info", text: "[EVENT] Pull Request #42 opened." },
      { delay: 1.5, type: "info", text: "[TASK] Fetching diff from target branch..." },
      { delay: 2.0, type: "success", text: "> Diff acquired. Ready for analysis." },
    ]
  },
  {
    icon: Code,
    label: "Reviews & Comments",
    title: "Intelligent Feedback.",
    desc: "AI reviews your code, identifying subtle bugs and suggesting architectural improvements directly in your GitHub PR timeline.",
    logs: [
      { delay: 1, type: "info", text: "[RAG] Embedding distance matched: Session logic." },
      { delay: 1.5, type: "error", text: "> Finding: Missing cleanup on session close." },
      { delay: 2.5, type: "success", text: "[ACTION] Review comment published to GitHub." },
    ]
  }
];

function PRAgent() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="relative py-32 px-6 md:px-20 max-w-7xl mx-auto border-t border-white/5">
      <div className="mb-20 text-center">
        <h2 className="text-4xl md:text-5xl font-light mb-6">How It <span className="font-serif italic text-white/50">Works</span></h2>
        <p className="text-foreground/50 text-lg">From connection to automated reviews in four simple steps.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

        {/* Left Diagram */}
        <div className="relative rounded-xl border border-white/10 p-8 flex flex-col justify-between bg-white/[0.01]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--primary)_0%,transparent_40%)] opacity-[0.05]" />
          <h3 className="font-mono text-xs uppercase tracking-widest text-primary mb-12">Workflow Integration</h3>

          <div className="flex-1 flex flex-col justify-center gap-4 md:gap-2 relative z-10 w-full max-w-sm mx-auto">
            {howItWorksSteps.map((step, idx) => (
              <React.Fragment key={idx}>
                <WorkflowNode
                  icon={step.icon}
                  label={step.label}
                  active={activeStep === idx}
                  onClick={() => setActiveStep(idx)}
                />
                {idx < howItWorksSteps.length - 1 && (
                  <div className="w-[1px] h-8 md:h-12 bg-white/10 mx-auto relative transition-colors duration-500">
                    {activeStep >= idx && (
                      <motion.div
                        layoutId={`flow-line-${idx}`}
                        className="absolute inset-0 bg-gradient-to-b from-primary to-transparent"
                      />
                    )}
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Right Dynamic Content */}
        <div className="relative flex flex-col gap-8">
          <div className="min-h-[140px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-4xl font-light mb-4">{howItWorksSteps[activeStep]?.title}</h2>
                <p className="text-foreground/50 text-lg max-w-md">{howItWorksSteps[activeStep]?.desc}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* <div className="rounded-xl border border-white/10 bg-[#0A0A0A] overflow-hidden shadow-2xl">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
              <TerminalIcon className="w-4 h-4 text-white/40" />
              <span className="font-mono text-xs text-white/40">agent output</span>
            </div>
            <div className="p-6 font-mono text-sm leading-relaxed min-h-[200px]">
              <AnimatePresence mode="wait">
                <motion.div key={activeStep}>
                  {howItWorksSteps[activeStep]?.logs?.map((log, i) => (
                    <TerminalLine key={i} delay={log.delay} type={log.type}>
                      {log.text}
                    </TerminalLine>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div> */}

          {/* Placeholder for Media */}
          <div className="w-full aspect-video rounded-xl border border-dashed border-white/20 bg-white/5 flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_70%)] opacity-0 group-hover:opacity-[0.05] transition-opacity duration-700" />
            <span className="font-mono text-xs text-white/30 uppercase tracking-widest"></span>
          </div>

        </div>

      </div>
    </section>
  );
}

function WorkflowNode({ icon: Icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all duration-300 text-left cursor-pointer ${active ? 'border-primary/50 bg-primary/10 scale-105' : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'}`}
    >
      <div className={`p-2 rounded-md ${active ? 'bg-primary/20 text-primary' : 'bg-white/10 text-white/50'}`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className={`font-mono text-sm ${active ? 'text-primary' : 'text-white/70'}`}>{label}</span>
    </motion.button>
  );
}

function TerminalLine({ children, delay, type = "info", className = "" }: { children: React.ReactNode, delay: number, type?: "info" | "success" | "error", className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: delay * 0.4 }}
      viewport={{ once: true }}
      className={`mb-2 ${type === 'info' ? 'text-white/60' : type === 'success' ? 'text-primary' : 'text-red-400'} ${className}`}
    >
      {children}
    </motion.div>
  );
}

function Features() {
  return (
    <section id="features" className="py-40 px-6 md:px-20 bg-[#050505]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20 text-center">
          <h2 className="text-4xl md:text-5xl font-light mb-6">Unified <span className="text-primary">Features</span></h2>
          <p className="text-foreground/50">Core capacities integrating advanced features and actionable insights.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
          {/* Card 1 */}
          <BentoCard
            className="md:col-span-2 relative group"
            title="Intelligent PR Reviews."
            description="Analyzes pull requests using context-aware retrieval to catch issues and suggest improvements."
            icon={<GitPullRequest className="w-8 h-8 text-primary" />}
          >
            {/* <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" /> */}
          </BentoCard>

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
          >
            {/* <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" /> */}
          </BentoCard>

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
          {description && <p className="text-foreground/60 text-sm mt-3 leading-relaxed max-w-sm">{description}</p>}
        </div>
      </div>
      {children}
    </GlowCard>
  );
}

function TechnicalProof() {
  return (
    <section className="py-32 px-4 bg-black/40">
      <div className="max-w-5xl mx-auto text-center mb-20">
        <h2 className="text-sm font-mono text-primary tracking-[0.3em] uppercase mb-4">The RAG Stack</h2>
        <p className="text-4xl font-serif italic text-white/80">High-Precision Engineering</p>
      </div>

      <div className="max-w-4xl mx-auto relative px-12 gap-12 flex flex-col md:flex-row items-center justify-between md:h-64 py-16 md:py-0 md:gap-0">
        {/* Connection Lines (hidden on mobile, shown on md screens) */}
        <div className="absolute inset-x-12 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-around pointer-events-none">
          {[1, 2, 3].map((i) => (
            <div key={i} className="relative flex-1 h-[1px] bg-white/10">
              <motion.div
                animate={{ left: ["0%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: i * 0.5 }}
                className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_1px_var(--primary)]"
              />
            </div>
          ))}
        </div>

        {[
          { icon: Code2, label: "Repo" },
          { icon: Layers, label: "Embeddings" },
          { icon: Database, label: "Vector DB" },
          { icon: Cpu, label: "LLM" }
        ].map((item, i) => (
          <div key={i} className="relative z-10 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-none border border-white/20 bg-background flex items-center justify-center group hover:border-primary transition-colors shadow-sm">
              <item.icon className="w-6 h-6 text-white/50 group-hover:text-primary transition-colors stroke-[1.5]" />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/50">{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function TicketPricing() {
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

function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const faqs = [
    { q: "How does the automated PR review agent work?", a: "Instead of generic checks, our AI analyzes pull requests using deep repository context. It catches potential issues, suggests actionable improvements, and meaningfully enhances code quality directly on GitHub." },
    { q: "What insights can I see on the Developer Analytics Dashboard?", a: "The dashboard tracks your complete engineering growth. You can easily monitor your commits, pull requests, and AI-generated reviews through customizable contribution graphs, streaks, and monthly performance trends." },
    { q: "Can I ask arbitrary questions about my own codebase?", a: "Yes! Once you connect your repository, CodeUnicorn indexes your code. Using our Codebase Chat, you can ask deep, technical questions and get context-aware answers instantly from your exact architecture." },
    { q: "How does the AI-powered Issue Analysis work?", a: "Through continuous webhook tracking, our system automatically evaluates new issues the moment they are opened, and immediately suggests the most relevant files to fix along with appropriate tags and labels." },
    { q: "Does CodeUnicorn help with writing project documentation?", a: "Absolutely. CodeUnicorn can generate comprehensive README files, team onboarding guides, and system design documents built entirely from the actual, true state of your codebase." },
    { q: "Is the platform privacy-safe and customizable?", a: "CodeUnicorn is inherently privacy-safe. You also have full control over the AI reviewer by defining custom analysis rules, setting specific focus areas, and configuring paths for the AI to completely ignore." }
  ];

  return (
    <section className="py-20 px-6 max-w-3xl mx-auto border-t border-white/5">
      <h2 className="font-mono text-sm tracking-widest text-center text-primary mb-16 uppercase">Engineering Logs</h2>
      <div className="space-y-2">
        {faqs.map((faq, idx) => (
          <div key={idx} className="border-b border-white/10 last:border-0">
            <button
              onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
              className="w-full flex items-center justify-between py-6 text-left group"
            >
              <h4 className="text-lg font-light group-hover:text-primary transition-colors">{faq.q}</h4>
              <ChevronDown className={`w-5 h-5 text-white/40 transition-transform duration-300 ${openIdx === idx ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {openIdx === idx && (
                <motion.div
                  initial={{ height: 0, opacity: 0, y: 10 }}
                  animate={{ height: "auto", opacity: 1, y: 0 }}
                  exit={{ height: 0, opacity: 0, y: -10 }}
                  className="overflow-hidden"
                >
                  <p className="pb-8 text-foreground/60 font-light leading-relaxed pr-8">{faq.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0.8, 1], [0, 1]);

  return (
    <footer className="relative h-[60vh] flex flex-col items-center justify-center overflow-hidden border-t border-white/5">
      <motion.div
        style={{ opacity }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div className="w-[800px] h-[800px] bg-primary rounded-full blur-[150px] opacity-[0.1]" />
      </motion.div>

      <div className="relative z-10 text-center w-full">
        <h2 className="text-xl md:text-7xl font-mono tracking-[0.7em] text-white/50 mb-12 uppercase ml-8 md:ml-24">
          CodeUnicorn
        </h2>

        <div className="flex items-center justify-center gap-8 font-mono text-sm text-foreground/40">
          <a href="#" className="hover:text-primary transition-colors">Twitter</a>
          <a href="#" className="hover:text-primary transition-colors">GitHub</a>
          <a href="#" className="hover:text-primary transition-colors">Docs</a>
        </div>
      </div>

      <div className="absolute bottom-6 w-full px-6 flex justify-between items-center text-xs font-mono text-white/30 z-20">
        <div>© 2026 CodeUnicorn </div>
        <div>Built for Engineers</div>
      </div>
    </footer>
  );
}

/* ── Animated Dashboard Visual for Hero ── */
const DashboardVisual = () => {
  return (
    <div className="absolute inset-x-0 bottom-0 top-0 bg-background flex p-3 md:p-5 gap-4 overflow-hidden">
      {/* Subtle dot grid background */}
      <motion.div
        animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 bg-[radial-gradient(rgba(16,185,129,0.08)_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"
      />

      {/* Left: Main Content Area */}
      <div className="flex-1 flex flex-col gap-3 md:gap-4 relative z-10">
        {/* Top Bar */}
        <div className="flex justify-between items-center bg-white/[0.03] border border-white/5 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
              <User2 className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="h-3 w-28 bg-white/15 rounded mb-1.5" />
              <div className="h-2 w-20 bg-white/8 rounded" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-7 w-16 bg-primary/10 rounded border border-primary/20" />
            <div className="h-7 w-7 bg-white/5 rounded border border-white/10" />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: GitCommit, val: "1,240", label: "Commits", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
            { icon: GitPullRequest, val: "42", label: "PRs", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
            { icon: Code, val: "85", label: "Reviews", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
            { icon: Activity, val: "14d", label: "Streak", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className={`bg-white/[0.02] border border-white/5 rounded-lg p-3 flex flex-col gap-2`}
            >
              <div className={`w-7 h-7 rounded-md ${stat.bg} border ${stat.border} flex items-center justify-center`}>
                <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
              </div>
              <div>
                <motion.span
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="text-lg md:text-xl font-light tabular-nums text-white/90 block"
                >
                  {stat.val}
                </motion.span>
                <span className="text-[9px] text-white/30 uppercase tracking-wider font-mono">{stat.label}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Chart Area */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          viewport={{ once: true }}
          className="flex-1 bg-white/[0.02] border border-white/5 rounded-lg p-4 md:p-5 flex flex-col relative overflow-hidden"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[9px] text-white/30 font-bold uppercase tracking-wider mb-1 font-mono">Monthly Commits</p>
              <h4 className="text-lg md:text-xl font-light text-white/90">8,420</h4>
            </div>
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="bg-emerald-500/10 text-emerald-400 text-[9px] font-bold px-2 py-1 rounded border border-emerald-500/20 flex items-center gap-1 font-mono"
            >
              +24%
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </motion.div>
          </div>
          <div className="flex-1 flex items-end gap-[3px] md:gap-1.5 justify-between">
            {[30, 45, 35, 60, 50, 80, 75, 90, 55, 70, 85, 95].map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: "5%" }}
                whileInView={{ height: `${h}%` }}
                animate={{ height: [`${h}%`, `${h - 8}%`, `${h}%`] }}
                transition={{
                  duration: 3 + i * 0.15,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.08,
                }}
                viewport={{ once: true }}
                className={`flex-1 rounded-t-[2px] transition-colors ${i === 11
                    ? "bg-primary opacity-90"
                    : i === 7
                      ? "bg-amber-500/70"
                      : "bg-white/10 hover:bg-white/25"
                  }`}
              />
            ))}
          </div>

          {/* Floating cursor — always visible */}
          <motion.div
            animate={{ x: [0, 80, -340, -80, 20], y: [0, -80, -240, -20, 50] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-8 right-16 z-30 drop-shadow-xl"
          >
            <MousePointer2 className="w-5 h-5 fill-white text-black/80 stroke-[1.5]" />
            <motion.div
              animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.4, 0.8, 0.4] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -top-2 -left-2 w-8 h-8 bg-white/20 rounded-full"
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Right: Side Panel */}
      <div className="w-48 md:w-56 hidden md:flex flex-col gap-3 relative z-10">
        {/* Activity Feed */}
        <div className="bg-white/[0.02] flex-1 border border-white/5 rounded-lg flex flex-col p-3 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-3.5 h-3.5 text-primary/60" />
            <span className="text-[9px] font-mono uppercase tracking-wider text-white/30">Recent Activity</span>
          </div>
          <div className="flex flex-col gap-2.5 relative z-10">
            {[1, 2, 3, 4, 5].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 15 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
                viewport={{ once: true }}
                className="p-2.5 bg-background/40 border border-white/5 rounded-md flex gap-2.5 items-start backdrop-blur-sm"
              >
                <div className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${i <= 2 ? 'bg-primary/80' : i === 3 ? 'bg-amber-500/60' : 'bg-white/20'
                  }`} />
                <div className="flex flex-col gap-1.5 w-full">
                  <div className="h-2 w-3/4 bg-white/15 rounded" />
                  <div className="h-1.5 w-1/2 bg-white/8 rounded" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Scanning effect */}
          <motion.div
            initial={{ top: "-20%" }}
            animate={{ top: "120%" }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
              repeatDelay: 2,
            }}
            className="absolute left-0 right-0 h-16 bg-gradient-to-b from-primary/0 via-primary/5 to-primary/0 border-b border-primary/10 pointer-events-none z-0"
          />
        </div>

        {/* Mini Issue Categories */}
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
          <span className="text-[9px] font-mono uppercase tracking-wider text-white/30 mb-3 block">Issues</span>
          <div className="flex flex-col gap-2">
            {[
              { w: "75%", color: "bg-red-400/60" },
              { w: "55%", color: "bg-amber-400/60" },
              { w: "40%", color: "bg-blue-400/60" },
              { w: "85%", color: "bg-emerald-400/60" },
            ].map((bar, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-1.5 w-10 bg-white/10 rounded" />
                <motion.div
                  initial={{ width: "0%" }}
                  whileInView={{ width: bar.w }}
                  transition={{ delay: 0.8 + i * 0.15, duration: 0.7, ease: "easeOut" }}
                  viewport={{ once: true }}
                  className={`h-2 ${bar.color} rounded-sm flex-1`}
                  style={{ maxWidth: bar.w }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};