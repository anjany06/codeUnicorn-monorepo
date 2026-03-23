"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-is-mobile";

export function Pulse() {
  const isMobile = useIsMobile();

  const blockCount = isMobile ? 100 : 300;

  const squares = useMemo(() => {
    return Array.from({ length: blockCount }).map((_, i) => {
      const x = Math.sin(i * 12.9898) * 43758.5453;
      const intensity = x - Math.floor(x);
      return { id: i, intensity };
    });
  }, [blockCount]);

  const renderSquares = () => (
    <div className="flex gap-2">
      {squares.map((sq) => (
        <motion.div
          key={sq.id}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{
            opacity: 1,
            scale: 1,
            backgroundColor: sq.intensity > 0.7 ? '#10b981' :
              sq.intensity > 0.4 ? 'rgba(16, 185, 129, 0.4)' :
                'rgba(16, 185, 129, 0.1)'
          }}
          viewport={{ once: true }}
          transition={{ delay: sq.id * 0.001 }}
          className="w-5 h-5 rounded-[2px] shrink-0"
          whileHover={{
            scale: 1.5,
            boxShadow: '0 0 15px rgba(16, 185, 129, 0.8)',
            zIndex: 10
          }}
        />
      ))}
    </div>
  );

  return (
    <section className="relative py-40 overflow-hidden bg-background">
      <div className="px-6 md:px-20 mb-16 max-w-7xl mx-auto">
        <h3 className="font-mono text-sm tracking-widest text-primary mb-4 uppercase">Developer Analytics</h3>
        <h2 className="text-4xl md:text-5xl font-light">Track Activity & Growth. <span className="font-serif italic text-white/50">Quantified.</span></h2>
        <p className="text-foreground/50 max-w-2xl mt-4 text-lg">
          Detailed insights into your commits, pull requests, AI reviews, and contribution graphs with customizable themes. Discover streaks, monthly trends, and performance patterns.
        </p>
      </div>

      <div className="w-full flex overflow-hidden">
        <div className="flex gap-2 px-4 animate-scroll-x w-max">
          {renderSquares()}
          {renderSquares()}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes scroll-x {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-scroll-x {
          animation: scroll-x 60s linear infinite;
          width: max-content;
        }
      `}} />
    </section>
  );
}
