"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export function FAQ() {
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
