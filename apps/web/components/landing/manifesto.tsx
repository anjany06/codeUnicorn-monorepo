"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function Manifesto() {
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
