"use client";

import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { User2, GitCommit, GitPullRequest, Code, Activity, MousePointer2 } from "lucide-react";
import { EtherealShadow } from "@/components/ui/etheral-shadow";
import { useIsMobile } from "@/hooks/use-is-mobile";

export function Hero() {
  const isMobile = useIsMobile();
  const { scrollY } = useScroll();

  // On mobile, disable scroll-linked transforms for performance
  const scaleDown = useTransform(scrollY, [0, 500], isMobile ? [1, 1] : [1, 0.95]);
  const yParallax = useTransform(scrollY, [0, 500], isMobile ? [0, 0] : [0, 100]);
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

/* ── Animated Dashboard Visual for Hero ── */
export const DashboardVisual = () => {
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
              <p className="text-[9px] text-white/30 font-bold uppercase tracking-wider mb-1 font-mono">Total Commits</p>
              <h4 className="text-lg md:text-xl font-light text-white/90">2,420</h4>
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
