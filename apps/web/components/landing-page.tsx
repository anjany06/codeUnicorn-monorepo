"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ChevronDown, Database, FileCode, Network, Terminal as TerminalIcon, GitPullRequest, Code2, Layers, Cpu, Code, ArrowRight } from "lucide-react";

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
      <Pulse />
      <PRAgent />
      <Features />
      <TechnicalProof />
      <TicketPricing />
      <FAQ />
      <Footer />
    </div>
  );
}

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full p-6 z-50 flex items-center justify-between mix-blend-difference">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-primary" />
        <span className="font-mono text-sm tracking-widest uppercase">CodeUnicorn</span>
      </div>
      <div className="flex gap-6 items-center">
        <a href="/login" className="text-sm font-mono hover:text-primary transition-colors">Log In</a>
        <a href="/login" className="text-sm font-mono border border-primary/50 px-4 py-2 hover:bg-primary hover:text-background transition-all rounded-sm uppercase tracking-wider">Deploy</a>
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
      <motion.div style={{ scale: scaleDown, y: yParallax }} className="text-center z-10 max-w-4xl mx-auto flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 mb-8 text-xs font-mono text-primary">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          v2.0 Early Access
        </div>
        <h1 className="text-6xl md:text-8xl font-normal leading-tight tracking-tight mb-8">
          GitHub Intelligence,<br />
          <span className="font-serif italic text-primary">Evolved.</span>
        </h1>
        <p className="text-xl md:text-2xl text-foreground/70 max-w-2xl font-light mb-12">
          PR Agents. Context-aware RAG Chat. The 12-month pulse of your engineering team.
        </p>
      </motion.div>

      <motion.div
        style={{ clipPath: clipPathReveal, y: useTransform(scrollY, [0, 500], [50, -50]) }}
        className="w-full max-w-6xl mt-12 relative z-20"
      >
        <div className="relative aspect-video rounded-xl bg-card border border-primary overflow-hidden shadow-[0_0_50px_-12px_var(--primary)] shadow-primary/20">
          {/* Device Frame Header */}
          <div className="absolute top-0 w-full h-8 border-b border-primary/20 bg-background/50 flex items-center px-4 gap-2 backdrop-blur-md">
            <div className="w-2 h-2 rounded-full bg-primary/20" />
            <div className="w-2 h-2 rounded-full bg-primary/40" />
            <div className="w-2 h-2 rounded-full bg-primary/60" />
            <div className="mx-auto font-mono text-[10px] text-primary/50">dashboard.codeunicorn.app</div>
          </div>
          {/* Dashboard Placeholder */}
          <div className="w-full h-full pt-8 bg-background flex flex-col">
            <div className="flex-1 w-full bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_100%)] opacity-[0.03]" />
            <div className="absolute inset-0 pt-8 flex items-center justify-center">
              <div className="flex flex-col items-center text-primary/30">
                <Code2 className="w-16 h-16 mb-4 opacity-50" />
                <span className="font-mono text-sm uppercase tracking-widest">[ Dashboard Visualization View ]</span>
              </div>
            </div>
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

  return (
    <section ref={ref} className="relative py-40 overflow-hidden bg-background">
      <div className="px-6 md:px-20 mb-16 max-w-7xl mx-auto">
        <h3 className="font-mono text-sm tracking-widest text-primary mb-4 uppercase">The Pulse</h3>
        <h2 className="text-4xl md:text-5xl font-light">12-Month Insights. <span className="font-serif italic text-white/50">Quantified.</span></h2>
      </div>

      <div className="w-full pl-6 md:pl-20">
        <motion.div style={{ x: xTransform }} className="flex gap-2 whitespace-nowrap min-w-max pb-10">
          {Array.from({ length: 150 }).map((_, i) => {
            const intensity = Math.random();
            const isActive = intensity > 0.6;
            return (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: (i % 20) * 0.02 }}
                key={i}
                className={`w-6 h-6 rounded-[2px] ${isActive ? 'bg-primary' : 'bg-primary/5 border border-primary/10'}`}
                style={{
                  opacity: isActive ? 0.4 + (intensity * 0.6) : 0.5,
                  boxShadow: isActive ? `0 0 ${intensity * 15}px var(--primary)` : 'none'
                }}
              />
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

function PRAgent() {
  return (
    <section className="relative py-32 px-6 md:px-20 max-w-7xl mx-auto border-t border-white/5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* Left Diagram */}
        <div className="relative h-[600px] rounded-xl border border-white/10 p-8 flex flex-col justify-between bg-white/[0.01]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--primary)_0%,transparent_40%)] opacity-[0.05]" />
          <h3 className="font-mono text-xs uppercase tracking-widest text-primary mb-12">Inngest Workflow</h3>

          <div className="flex-1 flex flex-col justify-center gap-8 relative z-10 w-full max-w-sm mx-auto">
            <WorkflowNode icon={GitPullRequest} label="PR Opened" active delay={0} />
            <div className="w-[1px] h-12 bg-gradient-to-b from-primary to-transparent mx-auto relative hidden md:block" />
            <WorkflowNode icon={Layers} label="Read Diff Context" delay={1} />
            <div className="w-[1px] h-12 bg-primary/20 mx-auto relative hidden md:block" />
            <WorkflowNode icon={Cpu} label="Agentic Analysis" delay={2} />
            <div className="w-[1px] h-12 bg-primary/20 mx-auto relative hidden md:block" />
            <WorkflowNode icon={Code} label="Post Comments" active delay={3} />
          </div>
        </div>

        {/* Right Terminal */}
        <div className="relative">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-light mb-4">The PR Agent.</h2>
              <p className="text-foreground/50 text-lg">Auto-review logic powered by RAG context.</p>
            </div>
            <div className="flex items-center gap-2 border border-primary/20 rounded-full px-4 py-1.5 bg-primary/5">
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-primary"
              />
              <span className="font-mono text-xs text-primary uppercase">Active</span>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0A0A0A] overflow-hidden shadow-2xl">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
              <TerminalIcon className="w-4 h-4 text-white/40" />
              <span className="font-mono text-xs text-white/40">agent output</span>
            </div>
            <div className="p-6 font-mono text-sm leading-relaxed">
              <TerminalLine delay={1}>[INFO] Incoming PR webhook detected.</TerminalLine>
              <TerminalLine delay={1.5}>[TASK] Fetching /src/components/auth...</TerminalLine>
              <TerminalLine delay={2.5}>[RAG] Embedding distance matched: Session logic.</TerminalLine>
              <TerminalLine delay={3.5} type="success" className="text-primary italic mt-4">&gt; Finding: Missing cleanup on session close.</TerminalLine>
              <TerminalLine delay={4.5}>[ACTION] Generating review comment...</TerminalLine>
              <TerminalLine delay={5.5}>[INFO] Comment posted successfully.</TerminalLine>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

function WorkflowNode({ icon: Icon, label, active = false, delay }: { icon: any, label: string, active?: boolean, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.2 }}
      viewport={{ once: true }}
      className={`flex items-center gap-4 p-4 rounded-lg border ${active ? 'border-primary/50 bg-primary/10 shadow-[0_0_20px_-5px_var(--primary)]' : 'border-white/10 bg-white/5'}`}
    >
      <div className={`p-2 rounded-md ${active ? 'bg-primary/20 text-primary' : 'bg-white/10 text-white/50'}`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className={`font-mono text-sm ${active ? 'text-primary' : 'text-white/70'}`}>{label}</span>
    </motion.div>
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
    <section className="py-40 px-6 md:px-20 bg-[#050505]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20 text-center">
          <h2 className="text-4xl md:text-5xl font-light mb-6">The <span className="font-serif italic text-primary">Emerald</span> Bento</h2>
          <p className="text-foreground/50">Core capacities that turn repos into knowledge graphs.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
          {/* Card 1 */}
          <BentoCard
            className="md:col-span-2 relative group"
            title="Context-aware Code Chat."
            icon={<Network className="w-8 h-8 text-primary" />}
          >
            <div className="absolute right-0 bottom-0 p-8 opacity-20 group-hover:opacity-100 transition-opacity duration-700">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
                <Network className="w-48 h-48 text-primary blur-sm" />
              </motion.div>
            </div>
          </BentoCard>

          {/* Card 2 */}
          <BentoCard
            className="md:col-span-1"
            title="Auto-Repo Documentation."
            icon={<FileCode className="w-8 h-8 text-primary" />}
          />

          {/* Card 3 */}
          <BentoCard
            className="md:col-span-3 h-full"
            title="Live Architecture Diagrams."
            icon={<Layers className="w-8 h-8 text-primary" />}
          >
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />
          </BentoCard>
        </div>
      </div>
    </section>
  );
}

function BentoCard({ title, icon, className = "", children }: { title: string, icon: React.ReactNode, className?: string, children?: React.ReactNode }) {
  return (
    <div className={`group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-8 transition-all duration-500 hover:bg-primary/5 hover:border-primary/50 ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-transparent transition-all duration-500" />
      <div className="relative z-10 h-full flex flex-col justify-between">
        <div className="p-3 rounded-lg bg-white/5 w-fit border border-white/10 group-hover:border-primary/30 group-hover:shadow-[0_0_20px_-5px_var(--primary)] transition-all duration-500">
          {icon}
        </div>
        <h3 className="text-2xl font-light max-w-[200px] mt-8 group-hover:text-primary transition-colors duration-500">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function TechnicalProof() {
  return (
    <section className="py-32 px-6 overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl font-light mb-20 font-serif italic text-white/80">The RAG Stack</h2>

        <div className="relative flex flex-col md:flex-row items-center justify-center gap-4 md:gap-10 py-10 w-full max-w-4xl mx-auto">

          <TechNode icon={Code2} label="Repo" />
          <AnimatedLine />
          <TechNode icon={FileCode} label="Embeddings" />
          <AnimatedLine />
          <TechNode icon={Database} label="Vector DB" />
          <AnimatedLine />
          <TechNode icon={Cpu} label="LLM" />

        </div>
      </div>
    </section>
  );
}

function TechNode({ icon: Icon, label }: { icon: any, label: string }) {
  return (
    <div className="flex flex-col items-center gap-4 relative z-10 w-full md:w-auto">
      <div className="w-20 h-20 flex items-center justify-center bg-background border border-white/20 text-white/50 rounded-none shadow-sm hover:border-primary hover:text-primary transition-colors duration-300">
        <Icon className="w-8 h-8 font-light stroke-[1]" />
      </div>
      <span className="font-mono text-xs uppercase tracking-widest text-white/50">{label}</span>
    </div>
  );
}

function AnimatedLine() {
  return (
    <div className="relative flex-1 h-px w-full md:w-20 md:h-[0px] bg-white/10 my-4 md:my-0 flex items-center justify-center md:flex-col md:rotate-0 rotate-90">
      <motion.div
        animate={{ x: ["-100%", "300%"] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_2px_var(--primary)] z-20 hidden md:block"
      />
    </div>
  );
}

function TicketPricing() {
  return (
    <section className="py-40 px-6 max-w-7xl mx-auto">
      <div className="mb-20 text-center">
        <h2 className="font-mono text-sm tracking-widest text-primary mb-4 uppercase">Access</h2>
        <h2 className="text-4xl md:text-5xl font-light">The <span className="font-serif italic text-white/60">Ticket</span></h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <PricingCard title="Starter" price="Free" features={["Basic RAG Search", "Public Repos", "Community Support"]} />
        <PricingCard title="Pro" price="$29/mo" features={["Private Repos", "Live Architecture", "PR Agents & Workflows", "Priority Support"]} highlight />
        <PricingCard title="Enterprise" price="Custom" features={["Unlimited Seats", "Custom Integrations", "Dedicated Account Manager"]} />
      </div>
    </section>
  );
}

function PricingCard({ title, price, features, highlight = false }: { title: string, price: string, features: string[], highlight?: boolean }) {
  // Torn edge effect using mask image concept applied via css or svg pattern
  return (
    <div className={`relative flex flex-col ${highlight ? 'scale-105 z-10' : 'scale-100 opacity-90'} transition-transform`}>
      <div className={`bg-white/5 border-l border-r ${highlight ? 'border-primary' : 'border-white/10'} p-8 min-h-[400px] flex flex-col mask-ticket`}>
        {/* Top tear effect */}
        <div className="absolute top-0 left-0 w-full h-[15px] bg-background" style={{ maskImage: "radial-gradient(circle at 10px 0, transparent 10px, black 11px)", maskSize: "20px 20px", maskRepeat: "repeat-x" }} />

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
          <button className="mt-auto w-full py-4 bg-primary text-background font-mono text-sm uppercase tracking-widest font-bold hover:bg-primary/90 transition-colors">
            Deploy Now
          </button>
        )}

        {/* Bottom tear effect */}
        <div className="absolute bottom-0 left-0 w-full h-[15px] bg-background" style={{ maskImage: "radial-gradient(circle at 10px 15px, transparent 10px, black 11px)", maskSize: "20px 20px", maskRepeat: "repeat-x" }} />
      </div>
    </div>
  );
}

function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const faqs = [
    { q: "How does CodeUnicorn differ from Copilot?", a: "CodeUnicorn focuses on repo-wide reasoning and async workflows (like PR review agents), acting as a team member rather than just an inline autocomplete." },
    { q: "What vector database powers the RAG?", a: "We utilize optimized edge-based embeddings with a customized vector store to guarantee rapid recall and maximum context preservation without latency." },
    { q: "Are my private repositories secure?", a: "Extremely. We follow SOC2 principles immediately discarding code snippets after embedding, ensuring your raw code never trains external models." }
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

      <div className="relative z-10 text-center">
        <h2 className="text-4xl md:text-8xl font-mono tracking-[0.8em] md:tracking-[1em] text-white/50 mb-12 uppercase ml-8 md:ml-24">
          CodeUnicorn
        </h2>

        <div className="flex items-center justify-center gap-8 font-mono text-sm text-foreground/40">
          <a href="#" className="hover:text-primary transition-colors">Twitter</a>
          <a href="#" className="hover:text-primary transition-colors">GitHub</a>
          <a href="#" className="hover:text-primary transition-colors">Docs</a>
        </div>
      </div>
    </footer>
  );
}