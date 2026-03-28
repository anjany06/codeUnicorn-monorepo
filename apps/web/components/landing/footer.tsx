"use client";

import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function Footer() {
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
          <a href="https://x.com/anjany06" className="hover:text-primary transition-colors">Twitter</a>
          <a href="https://github.com/anjany06" className="hover:text-primary transition-colors">GitHub</a>
          <a href="https://www.linkedin.com/in/anjany-pandey-927169294/" className="hover:text-primary transition-colors">Linkedin</a>
        </div>
      </div>

      <div className="absolute bottom-6 w-full px-6 flex justify-between items-center text-xs font-mono text-white/30 z-20">
        <div>© 2026 CodeUnicorn </div>
        <div>Built for Engineers</div>
      </div>
    </footer>
  );
}
