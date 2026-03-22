"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Github, GitPullRequest, Code2, Terminal, CheckCircle2,
  ChevronRight, Activity, GitCommit, FileText, Bot, Settings,
  Database, Network, Search, AlertCircle, Check
} from "lucide-react";

export function LandingPage() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-[#010409] text-[#c9d1d9] font-sans selection:bg-primary/30 selection:text-white overflow-hidden">
      <Navbar />
      <main className="flex flex-col items-center w-full">
        <Hero />
        <ProblemSolution />
        <PRReview />
        <DashboardStats />
        <IntegrationIndexing />
        <AIChatSection />
        <DocGenIssueIntell />
        <SettingsMock />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-6 py-4 flex items-center justify-between border-b border-white/10 bg-[#010409]/80 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <Code2 className="w-6 h-6 text-primary" />
        <span className="font-serif text-xl tracking-tight text-white font-medium">CodeUnicorn</span>
      </div>
      <div className="hidden md:flex gap-8 items-center text-sm font-medium text-white/60">
        <a href="#features" className="hover:text-white transition-colors">Features</a>
        <a href="#reviews" className="hover:text-white transition-colors">Code Reviews</a>
        <a href="#dashboard" className="hover:text-white transition-colors">Insights</a>
        <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
      </div>
      <div className="flex gap-4 items-center">
        <a href="/login" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Sign in</a>
        <a href="/login" className="px-4 py-2 text-sm font-medium bg-[#238636] border border-white/10 text-white rounded-md hover:bg-[#2ea043] transition-colors shadow-[0_0_15px_-5px_var(--primary)]">
          Connect with GitHub
        </a>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative w-full pt-40 pb-32 px-6 flex flex-col items-center border-b border-white/5">
      {/* Background Soft Emerald Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 mb-8 text-xs font-medium text-white/70"
        >
          <Github className="w-4 h-4 text-white/50" />
          <span>Deeply integrated with GitHub</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl tracking-tight mb-8 font-serif leading-tight text-white"
        >
          GitHub Intelligence Platform
          <motion.span 
            animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
            className="text-primary font-light inline-block w-4"
          >
            |
          </motion.span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-white/60 max-w-2xl font-light mb-10 leading-relaxed"
        >
          AI that reviews your code linearly, understands your repositories at scale, and tracks your engineering growth with precision.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <a href="/login" className="px-6 py-3 text-base font-medium bg-[#238636] border border-white/10 text-white rounded-md hover:bg-[#2ea043] transition-colors shadow-[0_0_20px_-5px_var(--primary)] flex items-center justify-center gap-2">
            <Github className="w-5 h-5" /> Connect with GitHub
          </a>
          <a href="#demo" className="px-6 py-3 text-base font-medium bg-white/5 border border-white/10 text-white rounded-md hover:bg-white/10 transition-colors flex items-center justify-center gap-2 group">
            <Terminal className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" /> Read Documentation
          </a>
        </motion.div>
      </div>

      <HeroFloatingUI />
    </section>
  );
}

function HeroFloatingUI() {
  const { scrollY } = useScroll();
  const yParallax = useTransform(scrollY, [0, 500], [0, -50]);

  return (
    <motion.div 
      style={{ y: yParallax }}
      initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}
      className="relative w-full max-w-5xl mt-20"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-[#010409] to-transparent z-20 pointer-events-none" />
      
      {/* GitHub-like Card UI */}
      <div className="relative z-10 rounded-xl border border-[#30363d] bg-[#0d1117] shadow-2xl overflow-hidden flex flex-col md:flex-row shadow-[0_0_50px_-15px_rgba(var(--primary),0.1)]">
        
        {/* Sidebar Mock */}
        <div className="w-full md:w-64 border-r border-[#30363d] bg-[#010409] p-4 flex flex-col gap-4 hidden md:flex">
          <div className="flex items-center gap-2 text-white/80 font-medium text-sm mb-4">
            <Activity className="w-4 h-4 text-white/50" /> Repositories
          </div>
          {["web-client", "api-gateway", "infra-ops"].map((r,i) => (
            <div key={i} className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm ${i===0 ? 'bg-[#238636]/10 text-primary font-medium' : 'text-white/50 hover:bg-white/5'}`}>
              <Database className={`w-4 h-4 ${i===0 ? 'text-primary' : 'text-white/40'}`} /> {r}
            </div>
          ))}
          <div className="mt-8">
            <div className="h-2 w-full bg-[#30363d] rounded-full overflow-hidden">
              <div className="h-full bg-primary w-[75%]" />
            </div>
            <div className="text-xs text-white/40 mt-2">Index sync: 75%</div>
          </div>
        </div>

        {/* Main Interface Mock */}
        <div className="flex-1 p-6 relative">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Code2 className="w-64 h-64 text-white" />
          </div>
          
          <div className="flex items-center gap-4 mb-6 border-b border-[#30363d] pb-4">
            <div className="px-3 py-1 rounded bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Agent Active
            </div>
            <h3 className="text-lg font-medium text-white">Pull Request #42: Optimize RAG queries</h3>
          </div>

          <div className="space-y-4 font-mono text-sm">
            <div className="flex bg-[#f85149]/10 text-[#f85149] px-4 py-1 rounded border border-[#f85149]/20">- const matches = await db.query(text);</div>
            <div className="flex bg-[#2ea043]/10 text-[#2ea043] px-4 py-1 rounded border border-[#2ea043]/20">{"+ const matches = await db.vectorSearch(embedding, { limit: 5 });"}</div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1, duration: 0.5 }}
              className="mt-4 p-4 rounded-lg bg-[#010409] border border-[#30363d]"
            >
              <div className="flex items-center gap-2 mb-2">
                <Bot className="w-4 h-4 text-primary" />
                <span className="text-white/80 font-sans font-medium text-xs">CodeUnicorn AI</span>
                <span className="text-white/40 text-[10px] ml-auto">Just now</span>
              </div>
              <p className="text-white/60 font-sans text-sm">Great optimization. Using <code className="bg-white/10 px-1 rounded text-primary">vectorSearch</code> prevents full-table scans. However, ensure <code className="bg-white/10 px-1 rounded">embedding</code> is sanitized before passing to the driver.</p>
            </motion.div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

function ProblemSolution() {
  return (
    <section className="w-full py-32 px-6 border-b border-[#30363d] bg-[#010409]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-serif text-white mb-4">From friction to velocity.</h2>
          <p className="text-white/50">Stop wasting cycles on manual reviews and blind onboarding.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#30363d] rounded-xl overflow-hidden border border-[#30363d]">
          {/* Problem */}
          <div className="bg-[#0d1117] p-10 flex flex-col justify-center min-h-[300px] relative">
            <div className="absolute inset-0 bg-[#0d1117] backdrop-blur-[2px] z-10 opacity-40 mix-blend-overlay" />
            <div className="relative z-20 space-y-6 opacity-70">
              <h3 className="text-xl font-medium text-white/50 mb-6 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-white/30" /> The Problem
              </h3>
              <ul className="space-y-4 text-white/50 font-medium">
                <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-white/20" /> Slow, manual PR reviews delaying deployments</li>
                <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-white/20" /> Unclear, undocumented legacy codebases</li>
                <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-white/20" /> Zero insights into engineering velocity</li>
              </ul>
            </div>
          </div>

          {/* Solution */}
          <div className="bg-[#0d1117] p-10 flex flex-col justify-center min-h-[300px] relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 z-0" />
            <div className="relative z-20 space-y-6">
               <h3 className="text-xl font-medium text-white mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" /> The Solution
              </h3>
              <ul className="space-y-4 text-white/80 font-medium">
                <motion.li initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} viewport={{once: true}} className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-primary" /> Instant AI codebase reviews
                </motion.li>
                <motion.li initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} viewport={{once: true}} className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-primary" /> Chat to understand any repository instantly
                </motion.li>
                <motion.li initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} viewport={{once: true}} className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-primary" /> Automated analytics & progress tracking
                </motion.li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PRReview() {
  return (
    <section id="reviews" className="w-full py-32 px-6 border-b border-[#30363d] bg-[#0d1117]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-16 items-center">
        <div className="flex-1 space-y-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
            <GitPullRequest className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-serif text-white">AI PR Reviews</h2>
          <p className="text-lg text-white/60 leading-relaxed max-w-md">
            Acting as a senior engineer, CodeUnicorn reads every diff, understands the global repository context via RAG embeddings, and leaves constructive in-line comments to prevent bugs before merging.
          </p>
          <a href="#" className="inline-flex items-center gap-2 text-primary text-sm font-medium hover:text-white transition-colors group">
            See how it integrates <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
        
        <div className="flex-1 w-full">
          <div className="rounded-xl border border-[#30363d] bg-[#010409] overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-[#30363d] bg-[#0d1117] flex items-center gap-3">
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-medium">Open</span>
              <span className="text-sm font-medium text-white/80">Refactor authentication flow</span>
            </div>
            <div className="p-6 font-mono text-sm leading-relaxed overflow-x-auto">
              <div className="text-white/40 mb-2">@@ -45,6 +45,8 @@</div>
              <div className="text-white/70">  const session = await getSession();</div>
              <div className="text-white/70">  if (!session) return redirect('/login');</div>
              <div className="bg-[#2ea043]/10 text-[#2ea043] px-2 py-0.5 rounded border border-[#2ea043]/20 my-1">+  // Validate token expiration</div>
              
              {/* Highlighted diff line */}
              <motion.div 
                initial={{ backgroundColor: "rgba(46,160,67,0)", borderColor: "rgba(46,160,67,0)" }}
                whileInView={{ backgroundColor: "rgba(46,160,67,0.1)", borderColor: "rgba(46,160,67,0.2)" }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="text-[#2ea043] px-2 py-0.5 rounded border my-1 relative"
              >
                +  if (isExpired(session.token)) throw new AuthError();
              </motion.div>

              {/* Bot Comment */}
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                whileInView={{ opacity: 1, height: "auto" }}
                transition={{ delay: 1, duration: 0.4 }}
                viewport={{ once: true }}
                className="mt-4 ml-4 p-4 rounded-lg bg-[#0d1117] border border-[#30363d] relative before:absolute before:top-4 before:-left-3 before:w-3 before:h-px before:bg-[#30363d]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-4 h-4 text-primary" />
                  <span className="text-white font-sans text-xs font-medium">CodeUnicorn</span>
                  <span className="px-1.5 py-0.5 text-[10px] uppercase font-sans tracking-wide bg-[#30363d] text-white/60 rounded">Author</span>
                </div>
                <p className="text-white/70 font-sans text-sm">
                  Excellent addition. Note that <code className="text-primary bg-primary/10 px-1 rounded">isExpired</code> expects a parsed JWT object, but <code className="text-white/80 bg-white/10 px-1 rounded">session.token</code> might be a raw string here based on `<span className="text-white/40 cursor-pointer hover:underline">src/lib/auth.ts</span>`.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardStats() {
  const [key, setKey] = useState(0);
  
  return (
    <section id="dashboard" className="w-full py-32 px-6 border-b border-[#30363d] bg-[#010409]">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-lg">
            <h2 className="text-3xl md:text-4xl font-serif text-white mb-4">Development Insights</h2>
            <p className="text-white/60">Visualize productivity, code quality, and repository health through meticulously crafted dashboards.</p>
          </div>
          <button onClick={() => setKey(k => k + 1)} className="text-xs bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 px-3 py-1.5 rounded transition-colors flex items-center gap-2">
             <Activity className="w-3 h-3" /> Refresh Data
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <DashboardCard title="Lines Analyzed" value="2.4M" active key={`a-${key}`} />
          <DashboardCard title="PRs Reviewed" value="842" delay={0.1} key={`b-${key}`} />
          <DashboardCard title="Time Saved (est)" value="140h" delay={0.2} key={`c-${key}`} />
        </div>

        {/* Contribution Style Grid */}
        <div className="w-full rounded-xl border border-[#30363d] bg-[#0d1117] p-8 overflow-x-auto">
          <div className="flex items-center justify-between mb-8 min-w-[600px]">
            <h3 className="text-white/80 text-sm font-medium">Codebase Activity Map</h3>
            <div className="flex gap-2 text-xs text-white/50 items-center">
              Less 
              <span className="w-3 h-3 rounded-sm bg-[#010409] border border-[#30363d]" />
              <span className="w-3 h-3 rounded-sm bg-[#0e4429]" />
              <span className="w-3 h-3 rounded-sm bg-[#006d32]" />
              <span className="w-3 h-3 rounded-sm bg-[#26a641]" />
              <span className="w-3 h-3 rounded-sm bg-[#39d353]" />
              More
            </div>
          </div>
          <div className="flex gap-1 min-w-[600px]" key={`grid-${key}`}>
            {Array.from({ length: 52 }).map((_, col) => (
              <div key={col} className="flex flex-col gap-1">
                {Array.from({ length: 7 }).map((_, row) => {
                  // Generate pseudo-random intensity but cluster them
                  const isHigh = Math.random() > 0.8;
                  const isMed = Math.random() > 0.5;
                  const isEmpty = Math.random() > 0.7;
                  
                  let bgClass = "bg-[#010409] border border-[#30363d]";
                  if (!isEmpty) {
                    if (isHigh) bgClass = "bg-[#39d353]";
                    else if (isMed) bgClass = "bg-[#26a641]";
                    else bgClass = "bg-[#0e4429]";
                  }

                  return (
                    <motion.div 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2, delay: (col * 0.01) + (row * 0.01) }}
                      key={row} 
                      className={`w-3.5 h-3.5 rounded-sm ${bgClass}`} 
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardCard({ title, value, active = false, delay = 0 }: { title: string, value: string, active?: boolean, delay?: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }} viewport={{once:true}}
      className={`rounded-xl border ${active ? 'border-primary/30 bg-primary/5 relative overflow-hidden' : 'border-[#30363d] bg-[#0d1117]'} p-6 flex flex-col justify-between hover:-translate-y-1 transition-transform`}
    >
      {active && (
         <motion.div 
           animate={{ x: ['-100%', '200%'] }} 
           transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
           className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent" 
         />
      )}
      <span className="text-sm font-medium text-white/50 mb-4">{title}</span>
      <span className={`text-4xl font-serif ${active ? 'text-primary' : 'text-white'}`}>{value}</span>
    </motion.div>
  );
}

function IntegrationIndexing() {
  return (
    <section className="w-full py-24 px-6 border-b border-[#30363d] bg-[#0d1117]">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
        <h2 className="text-3xl font-serif text-white mb-6">Frictionless Integration</h2>
        <p className="text-white/60 mb-12 max-w-lg">One click to authorize. We automatically clone, parse the AST, generate vector embeddings, and securely index your codebase.</p>
        
        <div className="w-full max-w-md p-8 rounded-xl border border-[#30363d] bg-[#010409] flex flex-col items-center">
          <Database className="w-10 h-10 text-white/30 mb-6" />
          <motion.div className="w-full space-y-4">
             <div className="flex justify-between text-xs font-medium text-white/50 mb-1">
               <span>Indexing CodeUnicorn/core-api</span>
               <span className="text-primary">Complete</span>
             </div>
             <div className="h-1.5 w-full bg-[#30363d] rounded-full overflow-hidden relative">
               <motion.div 
                 initial={{ width: "0%" }} whileInView={{ width: "100%" }} transition={{ duration: 1.5, ease: "easeOut" }} viewport={{once: true}}
                 className="absolute top-0 left-0 h-full bg-[#2ea043] shadow-[0_0_10px_0_#2ea043]" 
               />
             </div>
             <motion.div 
               initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 1.6 }} viewport={{once:true}}
               className="pt-2 text-sm text-[#2ea043] flex items-center justify-center gap-2 font-medium"
             >
                <CheckCircle2 className="w-4 h-4" /> Successfully indexed 12,402 files
             </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function AIChatSection() {
  return (
    <section className="w-full py-32 px-6 border-b border-[#30363d] bg-[#010409]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row-reverse gap-16 items-center">
        <div className="flex-1 space-y-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
            <Search className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-serif text-white">Repository Wide Understanding</h2>
          <p className="text-lg text-white/60 leading-relaxed max-w-md">
            Stop searching blindly. Ask architecture, logic, and debugging questions in natural language. We pull precise code fragments and explain them contextually.
          </p>
        </div>
        
        <div className="flex-1 w-full">
          <div className="rounded-xl border border-[#30363d] bg-[#0d1117] p-6 shadow-2xl flex flex-col h-[400px]">
             <div className="flex-1 overflow-y-auto space-y-6 pr-2">
               {/* User Message */}
               <div className="flex gap-4">
                 <div className="w-8 h-8 rounded shrink-0 bg-[#30363d] flex items-center justify-center text-white/60 text-xs font-mono">You</div>
                 <div className="flex-1 pt-1.5 text-sm text-white/90">Where is the rate-limiting logic applied for the API?</div>
               </div>
               {/* AI Message */}
               <div className="flex gap-4">
                 <div className="w-8 h-8 rounded shrink-0 bg-primary/20 border border-primary/30 flex items-center justify-center"><Bot className="w-4 h-4 text-primary" /></div>
                 <div className="flex-1 pt-1.5 text-sm text-white/70 space-y-4">
                   <p>The rate limiting logic is handled by the Upstash Redis middleware applied globally in the edge router.</p>
                   <div className="p-3 bg-[#010409] border border-[#30363d] rounded-md flex items-center gap-3">
                     <FileText className="w-4 h-4 text-white/50" />
                     <span className="font-mono text-xs text-white/80">src/middleware.ts</span>
                     <span className="text-[10px] text-white/40 ml-auto bg-white/5 px-2 py-0.5 rounded">Lines 12-40</span>
                   </div>
                   <div className="p-3 bg-[#010409] border border-[#30363d] rounded-md font-mono text-xs text-[#c9d1d9] overflow-x-hidden relative">
                     <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="absolute bottom-3 right-4 font-mono text-primary font-bold">|</motion.span>
                     <span className="text-white/40">export async function </span>middleware<span>(req) {'{'}</span><br/>
                     <span className="text-white/40 ml-4">const ip = req.ip ?? "127.0.0.1";</span><br/>
                     <span className="text-white/40 ml-4">const {'{'} success {'}'} = await ratelimit.limit(ip);</span>
                   </div>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DocGenIssueIntell() {
  return (
    <section className="w-full py-32 px-6 border-b border-[#30363d] bg-[#0d1117]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20 max-w-2xl mx-auto">
          <h2 className="text-3xl font-serif text-white mb-4">Beyond code search.</h2>
          <p className="text-white/50">Comprehensive tools for modern engineering workflows.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Doc Gen Card */}
          <div className="rounded-xl border border-[#30363d] bg-[#010409] p-8 hover:border-white/20 transition-colors group">
            <FileText className="w-8 h-8 text-white/40 mb-6 group-hover:text-primary transition-colors" />
            <h3 className="text-xl font-medium text-white mb-2">Auto-Documentation</h3>
            <p className="text-white/50 text-sm mb-6 leading-relaxed">Instantly generate READMEs, API swagger docs, and system architecture summaries based on pure code AST analysis.</p>
            <div className="w-full h-32 bg-[#0d1117] border border-[#30363d] rounded-lg p-4 font-mono text-xs text-white/40 overflow-hidden relative">
              <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#0d1117] to-transparent" />
              <div className="text-white/80 font-bold mb-2"># Core API Documentation</div>
              <div className="mb-2">## Authentication Endpoint</div>
              <div className="pl-2 border-l-2 border-primary/50 text-white/60">POST /api/v1/auth/login</div>
              <div className="mt-2 text-white/40">Expects a valid OAuth token from GitHub payload. Returns...</div>
            </div>
          </div>

          {/* Issue Intelligence Card */}
          <div className="rounded-xl border border-[#30363d] bg-[#010409] p-8 hover:border-white/20 transition-colors group">
             <Network className="w-8 h-8 text-white/40 mb-6 group-hover:text-primary transition-colors" />
             <h3 className="text-xl font-medium text-white mb-2">Issue Intelligence</h3>
             <p className="text-white/50 text-sm mb-6 leading-relaxed">Map GitHub issues directly to codebase segments instantly. AI predicts which files need editing to resolve a bug ticket.</p>
             <div className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-4 relative overflow-hidden">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-4 h-4 text-[#f85149]" /> 
                  <span className="text-sm font-medium text-white/90">Fix memory leak in websocket loop</span>
                </div>
                <div className="flex gap-2 mb-3 text-[10px] font-mono uppercase">
                   <span className="px-2 py-0.5 rounded-full bg-white/5 text-white/60 border border-white/10">Bug</span>
                   <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 flex gap-1 items-center"><Bot className="w-3 h-3"/> AI Scanned</span>
                </div>
                <div className="text-xs text-white/50 border-t border-[#30363d] pt-3">
                  Suggested Files: <span className="font-mono text-white/80">src/server/ws.ts</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SettingsMock() {
  return (
    <section className="w-full py-24 px-6 border-b border-[#30363d] bg-[#010409]">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-16">
         <div className="flex-1">
           <h2 className="text-3xl font-serif text-white mb-6">Designed for Power Users</h2>
           <p className="text-white/60 mb-6">Control exact boundaries. Whitelist specific directories, configure strict RAG rules, and enforce custom code review guidelines specifically for your team.</p>
           <ul className="space-y-3">
             <li className="flex items-center gap-3 text-sm text-white/80"><CheckCircle2 className="w-4 h-4 text-primary" /> Directory-level ignoring (.ragignore)</li>
             <li className="flex items-center gap-3 text-sm text-white/80"><CheckCircle2 className="w-4 h-4 text-primary" /> Configurable Agent prompts via yaml</li>
             <li className="flex items-center gap-3 text-sm text-white/80"><CheckCircle2 className="w-4 h-4 text-primary" /> Advanced API integration webhooks</li>
           </ul>
         </div>

         <div className="flex-1 w-full bg-[#0d1117] border border-[#30363d] rounded-xl p-6 shadow-xl">
           <div className="flex items-center gap-3 border-b border-[#30363d] pb-4 mb-4">
             <Settings className="w-5 h-5 text-white/50" />
             <h3 className="font-medium text-white/90">Agent Preferences</h3>
           </div>
           
           <div className="space-y-6">
             <div className="flex items-center justify-between">
               <div>
                 <div className="text-sm font-medium text-white/90">Enforce Strict Typing</div>
                 <div className="text-xs text-white/50">Agent will reject implicit ANYs.</div>
               </div>
               <div className="w-10 h-6 bg-primary rounded-full relative shadow-[0_0_10px_0_var(--primary)]">
                 <div className="w-4 h-4 bg-[#010409] rounded-full absolute right-1 top-1" />
               </div>
             </div>
             
             <div className="flex items-center justify-between opacity-50">
               <div>
                 <div className="text-sm font-medium text-white/90">Auto-merge safe docs</div>
                 <div className="text-xs text-white/50">Automatically approve doc-only PRs.</div>
               </div>
               <div className="w-10 h-6 bg-white/10 rounded-full relative">
                 <div className="w-4 h-4 bg-white/40 rounded-full absolute left-1 top-1" />
               </div>
             </div>

             <div>
               <div className="text-sm font-medium text-white/90 mb-2">Custom Pre-Prompt</div>
               <div className="w-full bg-[#010409] border border-primary/30 rounded-md p-3 text-xs text-white/70 font-mono focus-within:border-primary transition-colors cursor-text">
                 "Always suggest performance improvements for SQL queries."
               </div>
             </div>
           </div>
         </div>
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    { name: "Pro", price: "$29", desc: "Perfect for independent developers and small teams.", features: ["Unlimited Repos", "Full AI Code Chat", "Basic PR AI Review Agent"], cta: "Start Free Trial", featured: false },
    { name: "Enterprise", price: "Custom", desc: "Complete control and security for scaled organizations.", features: ["Single Tenant VPC Hosting", "Custom LLM Model Select", "Dedicated Account Manager", "SOC2 Compliance Reports"], cta: "Contact Sales", featured: true }
  ];

  return (
    <section id="pricing" className="w-full py-32 px-6 border-b border-[#30363d] bg-[#0d1117]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-serif text-white mb-4">Transparent Pricing</h2>
          <p className="text-white/50">No hidden costs. Scale securely.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {plans.map((p, i) => (
            <div key={i} className={`p-8 rounded-xl border flex flex-col ${p.featured ? 'border-primary/50 bg-[#010409] relative shadow-[0_0_40px_-15px_var(--primary)] hover:-translate-y-1 transition-transform' : 'border-[#30363d] bg-[#010409] hover:border-white/20 transition-colors'}`}>
               {p.featured && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-black text-xs font-bold uppercase tracking-wider rounded-full">Recommended</div>}
               <h3 className="text-xl font-medium text-white mb-2">{p.name}</h3>
               <p className="text-white/50 text-sm mb-6 pb-6 border-b border-[#30363d] h-20">{p.desc}</p>
               <div className="text-4xl font-serif text-white mb-8">{p.price}<span className="text-lg text-white/40 font-sans">{p.price !== 'Custom' && '/mo'}</span></div>
               
               <ul className="space-y-4 flex-1 mb-8">
                 {p.features.map((f, j) => (
                   <li key={j} className="flex items-start gap-3 text-sm text-white/70">
                     <Check className={`w-4 h-4 shrink-0 mt-0.5 ${p.featured ? 'text-primary' : 'text-white/40'}`} /> {f}
                   </li>
                 ))}
               </ul>

               <button className={`w-full py-3 rounded-md font-medium text-sm transition-colors ${p.featured ? 'bg-primary text-black hover:bg-primary/90' : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'}`}>
                 {p.cta}
               </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="relative w-full py-40 px-6 flex flex-col items-center border-b border-[#30363d] bg-[#010409] overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 text-center max-w-2xl mx-auto space-y-8">
        <h2 className="text-4xl md:text-5xl font-serif text-white">Ready to elevate your workflow?</h2>
        <p className="text-lg text-white/50">Connect your repositories in seconds and experience true codebase intelligence.</p>
        <div className="flex justify-center mt-8">
           <a href="/login" className="px-8 py-4 text-base font-medium bg-[#238636] border border-white/10 text-white rounded-md hover:bg-[#2ea043] transition-colors shadow-[0_0_25px_-5px_var(--primary)] flex items-center justify-center gap-2">
             <Github className="w-5 h-5" /> Start Analyzing Free
           </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="w-full py-12 px-6 bg-[#010409]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-white/60" />
          <span className="font-serif text-white/80 font-medium">CodeUnicorn</span>
        </div>
        <div className="flex gap-6 text-sm text-white/50 font-medium">
          <a href="#" className="hover:text-white transition-colors">Documentation</a>
          <a href="#" className="hover:text-white transition-colors">GitHub</a>
          <a href="#" className="hover:text-white transition-colors">Twitter</a>
          <a href="#" className="hover:text-white transition-colors">Terms & Privacy</a>
        </div>
        <div className="text-white/30 text-xs">
          &copy; 2026 CodeUnicorn. All rights reserved. Built for developers.
        </div>
      </div>
    </footer>
  );
}
