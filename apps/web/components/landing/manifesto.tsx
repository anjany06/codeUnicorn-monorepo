"use client";

import React, { useRef, useMemo } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Quote, Compass, FileText, ShieldAlert, Zap, Code, Terminal, Cpu, Database, Network, Search, CpuIcon } from "lucide-react";
import { EtherealShadow } from "@/components/ui/etheral-shadow";

const marqueeItems = [
  { label: "Semantic Analysis", icon: Compass },
  { label: "PR Intelligence", icon: FileText },
  { label: "Pattern Detection", icon: ShieldAlert },
  { label: "Code Refactoring", icon: Zap },
  { label: "Structural Mapping", icon: Database },
  { label: "Logic Inversion", icon: Cpu },
  { label: "Contextual Audit", icon: Terminal },
  { label: "Deep Trace", icon: Network },
  { label: "Neural Search", icon: Search },
  { label: "Bite-sized Briefs", icon: Code },
];

function MarqueeColumn({ items, direction = "up", speed = 40 }: { items: typeof marqueeItems, direction?: "up" | "down", speed?: number }) {
  const columnItems = useMemo(() => [...items, ...items], [items]);
  
  return (
    <div className="flex flex-col gap-6 relative overflow-hidden h-[800px]">
      <motion.div
        animate={{
          y: direction === "up" ? ["0%", "-50%"] : ["-50%", "0%"],
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: "linear",
        }}
        className="flex flex-col gap-6"
      >
        {columnItems.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-4 px-6 py-4 rounded-xl border border-white/5 bg-white/2 backdrop-blur-sm whitespace-nowrap group hover:border-emerald-500/20 transition-colors"
          >
            <item.icon className="w-4 h-4 text-emerald-500/50 group-hover:text-emerald-400 transition-colors" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60 group-hover:text-white transition-colors">
              {item.label}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export function Manifesto() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Smoother scroll progress for headline
  const smoothProgress = useSpring(scrollYProgress, {
    mass: 0.1,
    stiffness: 80,
    damping: 30,
  });

  // Headline Transforms
  const headlineOpacity = useTransform(smoothProgress, [0.1, 0.3], [0, 1]);
  const headlineY = useTransform(smoothProgress, [0.1, 0.3], [50, 0]);
  
  const revealProgress = useTransform(smoothProgress, [0.3, 0.5], [0, 1]);
  const widthTransform = useTransform(revealProgress, [0, 1], ["0%", "100%"]);
  const blurTransform = useTransform(revealProgress, [0, 0.8], ["16px", "0px"]);
  const intelligenceScale = useTransform(revealProgress, [0, 1], [0.9, 1]);
  
  // Parallax elements
  const bgY1 = useTransform(smoothProgress, [0, 1], ["-10%", "10%"]);
  const bgY2 = useTransform(smoothProgress, [0, 1], ["10%", "-10%"]);

  return (
    <section 
      ref={containerRef} 
      className="relative min-h-[140vh] flex flex-col items-center justify-center px-6 overflow-hidden bg-background py-40 border-y border-white/5"
    >
      {/* Premium Background Ambiance */}
      <EtherealShadow
        color="rgba(16, 185, 129, 0.1)"
        animation={{ scale: 90, speed: 30 }}
        noise={{ opacity: 0.15, scale: 1 }}
        className="opacity-50 pointer-events-none"
      />
      
      {/* Dynamic Grid Background */}
      <div 
        className="absolute inset-0 bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_30%,#000_20%,transparent_100%)] pointer-events-none" 
        style={{ backgroundImage: 'linear-gradient(to right, #8080800a 1px, transparent 1px), linear-gradient(to bottom, #8080800a 1px, transparent 1px)' }}
      />

      {/* Marquee Background Flow (The "Up/Down" loop) */}
      <div className="absolute inset-0 flex items-center justify-center gap-20 opacity-20 pointer-events-none select-none mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_20%,transparent_80%)]">
        <MarqueeColumn items={marqueeItems} direction="up" speed={60} />
        <MarqueeColumn items={marqueeItems} direction="down" speed={70} />
        <div className="hidden lg:flex gap-20">
            <MarqueeColumn items={marqueeItems} direction="up" speed={55} />
            <MarqueeColumn items={marqueeItems} direction="down" speed={65} />
        </div>
      </div>

      {/* Parallax Background Text */}
      <motion.div 
        style={{ y: bgY1, opacity: useTransform(smoothProgress, [0, 0.5], [0.05, 0.1]) }}
        className="absolute top-1/4 -left-32 text-[25vw] font-serif italic text-emerald-500 whitespace-nowrap pointer-events-none select-none blur-[2px]"
      >
        Deep Context
      </motion.div>
      <motion.div 
        style={{ y: bgY2, opacity: useTransform(smoothProgress, [0, 0.5], [0.03, 0.08]) }}
        className="absolute bottom-1/4 -right-32 text-[20vw] font-serif italic text-emerald-500 whitespace-nowrap pointer-events-none select-none blur-sm"
      >
        Intelligence
      </motion.div>

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center">
        {/* Subtle Label */}
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 flex items-center gap-4"
        >
            <div className="h-px w-8 bg-emerald-500/30" />
            <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-emerald-500/60">The New Paradigm</span>
            <div className="h-px w-8 bg-emerald-500/30" />
        </motion.div>

        {/* Main Headline */}
        <motion.div 
          style={{ opacity: headlineOpacity, y: headlineY }}
          className="text-center mb-40"
        >
          <h2 className="text-7xl md:text-[10rem] font-light tracking-tighter text-muted-foreground/20 leading-none mb-4 select-none">
            Not Grep.
          </h2>
          <div className="relative inline-block overflow-visible">
            <span className="text-7xl md:text-[10rem] font-light tracking-tighter text-muted-foreground/10 leading-none opacity-0 select-none">
              Intelligence.
            </span>
            <motion.span
              className="absolute left-0 top-0 overflow-hidden whitespace-nowrap bg-clip-text text-transparent bg-linear-to-r from-emerald-400 via-emerald-100 to-emerald-500 py-4"
              style={{ 
                width: widthTransform, 
                filter: blurTransform,
                scale: intelligenceScale,
                textShadow: "0 0 40px rgba(16, 185, 129, 0.2)"
              }}
            >
              <span className="text-7xl md:text-[10rem] font-light tracking-tighter leading-none">
                Intelligence.
              </span>
            </motion.span>
          </div>
        </motion.div>

        {/* Bottom Quote Section */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 1 }}
            className="relative max-w-3xl w-full"
        >
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-10">
              <Quote className="w-24 h-24 text-emerald-500 rotate-180" />
            </div>
            
            <div className="relative z-10 text-center space-y-6">
              <p className="text-2xl md:text-3xl font-serif italic text-foreground/60 leading-relaxed font-light">
                "Searching for strings is <span className="text-emerald-500/80">archaeology</span>. <br />
                Understanding code is <span className="text-white">engineering</span>."
              </p>
              
              <div className="flex items-center justify-center gap-3">
                <div className="h-px w-12 bg-linear-to-r from-transparent to-emerald-500/20" />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40">Technical Manifesto 2026</span>
                <div className="h-px w-12 bg-linear-to-l from-transparent to-emerald-500/20" />
              </div>
            </div>
        </motion.div>
      </div>

      <div className="absolute inset-0 pointer-events-none border border-emerald-500/3 rounded-[100%] scale-[1.2] -z-10" />

      {/* grain overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay" 
        style={{ backgroundImage: `url('https://framerusercontent.com/images/r9v9v9v9v9v9v9v9v9v9v.png')` }} 
      />
    </section>
  );
}



