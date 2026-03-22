"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowRight, Terminal, Github, GitPullRequest, Code2, Copy, CheckCircle2, ChevronDown, MoveRight, Layers, Cpu, Code, Zap, Database } from "lucide-react";

export function LandingPage() {

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-[#050505] text-foreground font-sans overflow-hidden selection:bg-primary selection:text-black">
      <Navbar />
      <main className="flex flex-col items-center w-full">
        <Hero />
        <LogosSection />
        <FeaturesZigZag />
        <BentoGrid />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-6 py-4 flex items-center justify-between border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary via-primary/80 to-primary/40 flex items-center justify-center">
          <Code2 className="w-3 h-3 text-black" />
        </div>
        <span className="font-serif italic text-xl text-white">CodeUnicorn</span>
      </div>
      <div className="hidden md:flex gap-8 items-center text-sm text-white/60 font-medium">
        <a href="#features" className="hover:text-primary transition-colors">Features</a>
        <a href="#workflows" className="hover:text-primary transition-colors">Workflows</a>
        <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
      </div>
      <div className="flex gap-4 items-center">
        <a href="/login" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Log in</a>
        <a href="/login" className="px-5 py-2 text-sm font-semibold bg-primary text-black rounded-full hover:bg-primary/90 transition-transform hover:scale-105 active:scale-95 flex items-center gap-2">
          Start for free <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </nav>
  );
}

function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.3, 0.15],
          x: [0, 100, 0],
          y: [0, 50, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/30 blur-[120px]"
      />
      <motion.div
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.1, 0.2, 0.1],
          x: [0, -100, 0],
          y: [0, -50, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-primary/20 blur-[150px]"
      />
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,#000_60%,transparent_100%)]" />
    </div>
  );
}

function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 200]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  return (
    <section className="relative w-full pt-40 pb-20 px-6 flex flex-col items-center">
      <HeroBackground />

      <motion.div style={{ y, opacity }} className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 mb-8 backdrop-blur-sm shadow-[0_0_20px_-5px_var(--primary)]"
        >
          <Zap className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">Introducing CodeUnicorn v2.0</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="text-6xl md:text-8xl tracking-tight mb-8 font-serif leading-[1.1] text-white"
        >
          Intelligence for your <br className="hidden md:block" />
          <span className="text-primary italic">engineering workflow.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl md:text-2xl text-white/50 max-w-2xl font-light mb-12 font-sans leading-relaxed"
        >
          Automated PR reviews, context-aware codebase chat, and profound insights. The ultimate AI coworker for modern teams.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center"
        >
          <a href="/login" className="w-full sm:w-auto px-8 py-4 text-lg font-semibold bg-primary text-black rounded-lg hover:bg-primary/90 transition-all hover:shadow-[0_0_40px_-10px_var(--primary)] text-center flex items-center justify-center gap-3">
            <Github className="w-5 h-5" /> Continue with GitHub
          </a>
          <a href="#demo" className="w-full sm:w-auto px-8 py-4 text-lg font-medium bg-white/5 text-white border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-center flex items-center justify-center gap-2 group">
            <Terminal className="w-5 h-5 text-white/50 group-hover:text-primary transition-colors" /> Read the Docs
          </a>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
        className="w-full max-w-6xl mt-24 relative z-20 group perspective-[2000px]"
      >
        <div className="relative aspect-video rounded-xl bg-[#0A0A0A] border border-white/10 overflow-hidden shadow-2xl transition-transform duration-700 ease-out transform-gpu sm:hover:rotate-x-[2deg] sm:-rotate-x-[2deg] rotate-0 shadow-primary/10">
          <div className="absolute top-0 w-full h-12 border-b border-white/10 bg-[#0E0E0E] flex items-center px-4 gap-2 backdrop-blur-md z-10">
            <div className="flex gap-2 mr-4">
              <div className="w-3 h-3 rounded-full bg-white/10" />
              <div className="w-3 h-3 rounded-full bg-white/10" />
              <div className="w-3 h-3 rounded-full bg-white/10" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="w-1/3 h-6 bg-white/5 rounded flex items-center justify-center border border-white/5">
                <div className="font-mono text-[10px] text-white/30 hidden sm:block">dashboard.codeunicorn.app</div>
              </div>
            </div>
          </div>
          <div className="w-full h-full pt-12 bg-[#050505] flex flex-col relative overflow-hidden">
            {/* Replace with video later */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_60%)] opacity-[0.05]" />

            {/* Mock Dashboard UI elements */}
            <div className="flex w-full h-full p-4 gap-4">
              {/* Sidebar Mock */}
              <div className="w-48 sm:w-64 h-full bg-white/5 rounded-lg border border-white/5 p-4 flex flex-col gap-3">
                <div className="w-full h-8 bg-white/10 rounded" />
                <div className="w-3/4 h-4 bg-white/5 rounded mt-4" />
                <div className="w-5/6 h-4 bg-white/5 rounded" />
                <div className="w-4/5 h-4 bg-white/5 rounded" />
              </div>
              {/* Main Content Mock */}
              <div className="flex-1 flex flex-col gap-4">
                <div className="w-full h-32 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center shadow-[inset_0_0_30px_rgba(var(--primary),0.05)]">
                  <Code2 className="w-8 h-8 text-primary/40 animate-pulse" />
                </div>
                <div className="flex gap-4 flex-1">
                  <div className="flex-1 bg-white/5 rounded-lg border border-white/5" />
                  <div className="flex-1 bg-white/5 rounded-lg border border-white/5" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Glow behind device */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[50%] bg-primary/20 blur-[100px] -z-10 rounded-full" />
      </motion.div>
    </section>
  );
}

function LogosSection() {
  return (
    <section className="w-full py-10 border-b border-white/5 bg-white/[0.01]">
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
        <p className="text-sm text-white/40 mb-8 font-mono uppercase tracking-widest text-center">Trusted by modern engineering teams</p>
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-2 text-white/80 font-serif italic text-xl">
              <Layers className="w-5 h-5" /> Startup {i}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesZigZag() {
  return (
    <section id="features" className="w-full py-32 relative">
      <div className="max-w-7xl mx-auto px-6 flex flex-col gap-32">

        {/* Feature 1 */}
        <div className="flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 space-y-6">
            <h3 className="font-mono text-primary text-sm tracking-widest uppercase">The PR Agent</h3>
            <h2 className="text-4xl md:text-5xl font-serif text-white leading-tight">Automated, context-rich <br /><span className="italic text-white/70">code reviews.</span></h2>
            <p className="text-lg text-white/50 leading-relaxed font-sans">
              Stop waiting for senior engineers to approve minor changes. Our agent reads your diff, understands the repository context, and leaves deeply insightful comments in seconds.
            </p>
            <ul className="space-y-4 pt-4">
              {["Finds missing cleanup logic", "Suggests optimized queries", "Detects architectural drift"].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-white/80"><CheckCircle2 className="w-5 h-5 text-primary" /> {item}</li>
              ))}
            </ul>
          </div>
          <div className="flex-1 w-full">
            <div className="relative rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 shadow-2xl">
              <div className="flex flex-col gap-4">
                {/* Fake GitHub comment UI */}
                <div className="flex gap-4 p-4 rounded-lg bg-white/5 border border-white/5 w-[90%] ml-auto">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/40 shrink-0" />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white">CodeUnicorn</span>
                      <span className="text-xs text-white/40 border border-primary/20 bg-primary/10 text-primary px-2 rounded-full">AI Agent</span>
                    </div>
                    <p className="text-sm text-white/80 font-sans">Wait, this database query might cause an N+1 problem and lacks index usage. Consideration applied to <span className="font-mono text-primary bg-primary/10 px-1 rounded">getUsers()</span>.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2 */}
        <div className="flex flex-col md:flex-row-reverse items-center gap-16">
          <div className="flex-1 space-y-6">
            <h3 className="font-mono text-primary text-sm tracking-widest uppercase">RAG Engine</h3>
            <h2 className="text-4xl md:text-5xl font-serif text-white leading-tight">Chat with your <br /><span className="italic text-white/70">entire codebase.</span></h2>
            <p className="text-lg text-white/50 leading-relaxed font-sans">
              Instant answers to complex architectural questions. We parse, embed, and index every line of code so you can query your repository naturally.
            </p>
            <a href="#demo" className="inline-flex items-center gap-2 text-primary hover:text-white transition-colors font-semibold mt-4">
              Explore the Engine <MoveRight className="w-4 h-4" />
            </a>
          </div>
          <div className="flex-1 w-full">
            <div className="relative rounded-xl border border-white/10 bg-[#0A0A0A] p-6 shadow-2xl overflow-hidden h-80 flex items-center justify-center">
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />

              {/* SVG Animation of Nodes connected */}
              <svg viewBox="0 0 400 300" className="w-full h-full stroke-white/20 fill-none overflow-visible">
                <motion.path
                  d="M 50 150 Q 150 50 200 150 T 350 150"
                  strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
                <motion.path
                  d="M 50 150 Q 150 250 200 150 T 350 150"
                  strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
                />

                {/* Glowing dots traveling */}
                <motion.circle r="4" className="fill-primary stroke-none"
                  animate={{ rx: [50, 200, 350], cy: [150, 150, 150] }}
                >
                  <animateMotion dur="4s" repeatCount="indefinite" path="M 50 150 Q 150 50 200 150 T 350 150" />
                </motion.circle>
                <motion.circle r="4" className="fill-primary stroke-none"
                  animate={{ rx: [50, 200, 350], cy: [150, 150, 150] }}
                >
                  <animateMotion dur="4s" repeatCount="indefinite" path="M 50 150 Q 150 250 200 150 T 350 150" />
                </motion.circle>

                {/* Icons */}
                <rect x="30" y="130" width="40" height="40" rx="8" className="fill-[#111] stroke-white/20" />
                <rect x="180" y="130" width="40" height="40" rx="8" className="fill-primary/20 stroke-primary/50" />
                <rect x="330" y="130" width="40" height="40" rx="8" className="fill-[#111] stroke-white/20" />
              </svg>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

function BentoGrid() {
  return (
    <section className="w-full py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">Designed for <span className="italic">velocity.</span></h2>
          <p className="text-white/50 text-lg">Every feature you need to scale your engineering output, beautifully integrated into one platform.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px] md:auto-rows-[300px]">
          {/* Card 1 */}
          <div className="md:col-span-2 group relative overflow-hidden rounded-2xl border border-white/5 bg-[#090909] p-8 hover:bg-[#0c0c0c] hover:border-white/10 transition-all">
            <div className="absolute top-0 right-0 p-6 opacity-30 group-hover:opacity-100 transition-opacity">
              <Code2 className="w-32 h-32 text-white/5" />
            </div>
            <div className="relative z-10 h-full flex flex-col justify-end">
              <h3 className="text-2xl font-serif mb-2 text-white group-hover:text-primary transition-colors">Language Agnostic</h3>
              <p className="text-white/50 max-w-sm">From Python to Rust, we deeply understand the AST of over 40 languages.</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="md:col-span-1 group relative overflow-hidden rounded-2xl border border-white/5 bg-[#090909] p-8 hover:bg-[#0c0c0c] hover:border-white/10 transition-all flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-serif mb-2 text-white group-hover:text-primary transition-colors">Instant Sync</h3>
            <p className="text-white/50 text-sm">Real-time webhook ingestion.</p>
          </div>

          {/* Card 3 */}
          <div className="md:col-span-1 group relative overflow-hidden rounded-2xl border border-white/5 bg-[#090909] p-8 hover:bg-[#0c0c0c] hover:border-white/10 transition-all">
            <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 h-full flex flex-col justify-between">
              <Database className="w-8 h-8 text-white/30 group-hover:text-primary transition-colors" />
              <div>
                <h3 className="text-xl font-serif mb-2 text-white">Vector Search</h3>
                <p className="text-white/50 text-sm">Sub-millisecond semantic code search.</p>
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="md:col-span-2 group relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 p-8 transition-all hover:bg-primary/10 hover:border-primary/40 shadow-[inset_0_0_80px_rgba(var(--primary),0.05)]">
            <div className="relative z-10 w-1/2 h-full flex flex-col justify-center">
              <h3 className="text-3xl font-serif mb-4 text-white">Security First</h3>
              <p className="text-white/70">SOC2 compliant out of the box. Your code is vaulted, never leaves our isolated VPCs, and is never used to train public models.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="w-full py-32 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">Simple, transparent <span className="italic text-primary">pricing</span></h2>
          <p className="text-white/50 text-lg">Start free, upgrade when your team scales.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { tag: "Hobby", price: "$0", desc: "For independent developers", features: ["1 Public Repository", "100 Queries/mo", "Basic RAG"], featured: false },
            { tag: "Pro", price: "$29", desc: "For small remote teams", features: ["Unlimited Repositories", "Unlimited Queries", "PR Review Agent", "Priority Support"], featured: true },
            { tag: "Enterprise", price: "Custom", desc: "For large organizations", features: ["Custom VPC deployment", "Dedicated Account Manager", "SSO & Audit Logs", "Unlimited Agents"], featured: false }
          ].map((plan, i) => (
            <div key={i} className={`relative p-8 rounded-2xl border ${plan.featured ? 'border-primary shadow-[0_0_30px_-10px_var(--primary)] bg-primary/5' : 'border-white/10 bg-[#0A0A0A] hover:border-white/20'} flex flex-col transition-colors`}>
              {plan.featured && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-black font-semibold text-xs px-3 py-1 rounded-full uppercase tracking-wider">Most Popular</div>
              )}
              <h3 className="text-xl font-sans font-medium text-white mb-2">{plan.tag}</h3>
              <div className="flex items-end gap-1 mb-4">
                <span className="text-5xl font-serif">{plan.price}</span>
                {plan.price !== "Custom" && <span className="text-white/40 mb-2">/mo</span>}
              </div>
              <p className="text-white/50 text-sm mb-8">{plan.desc}</p>

              <a href="/login" className={`w-full py-3 rounded-lg flex items-center justify-center font-medium transition-colors mb-8 ${plan.featured ? 'bg-primary text-black hover:bg-primary/90' : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'}`}>
                Get Started
              </a>

              <ul className="space-y-4 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-3 text-sm text-white/70">
                    <CheckCircle2 className={`w-4 h-4 ${plan.featured ? 'text-primary' : 'text-white/30'}`} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const faqs = [
    { q: "Do I need to host my own vector database?", a: "No. CodeUnicorn fully manages the embedding, storage, and retrieval pipeline for you. Connect your repo and start chatting instantly." },
    { q: "Is there a limit to repository size?", a: "Pro accounts can index repositories up to 5GB in raw text size. Enterprise accounts have custom infrastructure limits." },
    { q: "Which Git providers are supported?", a: "Currently, we offer deeply integrated GitHub support. GitLab and Bitbucket are in active development." }
  ];

  return (
    <section className="w-full py-24 px-6 border-t border-white/5">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-serif text-white mb-12 text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <FAQItem key={i} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/10 rounded-xl bg-[#090909] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
      >
        <h4 className="font-sans font-medium text-white">{question}</h4>
        <ChevronDown className={`w-5 h-5 text-white/40 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-0 text-white/50 text-sm leading-relaxed">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Footer() {
  return (
    <footer className="w-full py-12 px-6 border-t border-white/5 bg-[#050505]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-primary" />
          <span className="font-serif italic text-white/80">CodeUnicorn</span>
        </div>
        <div className="flex gap-6 text-sm text-white/40 font-mono">
          <a href="#" className="hover:text-primary transition-colors">Twitter</a>
          <a href="#" className="hover:text-primary transition-colors">GitHub</a>
          <a href="#" className="hover:text-primary transition-colors">Terms</a>
          <a href="#" className="hover:text-primary transition-colors">Privacy</a>
        </div>
        <div className="text-white/30 text-xs">
          &copy; 2026 CodeUnicorn. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
