"use client";

import React from "react";
import { motion } from "framer-motion";
import { Code2, Layers, Database, Cpu } from "lucide-react";

export function TechnicalProof() {
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
