"use client";

import React, { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { Github, Sparkles, ArrowLeft, ArrowRight, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ConnectButton } from "@/app/dashboard/repository/_components/connect-button";
import { motion, Variants } from "framer-motion";
import { EtherealShadow } from "@/components/ui/etheral-shadow";

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const fadeUpItem: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function LoginUI() {
  const [loading, setLoading] = useState(false);

  const handleGitHubLogin = async () => {
    if (loading) return;
    setLoading(true);

    try {
      await signIn.social({
        provider: "github",
        callbackURL: "/dashboard",
      });
    } catch (error) {
      console.error("Error during GitHub sign-in:", error);
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative min-h-screen overflow-hidden bg-background text-foreground selection:bg-emerald-600/30 selection:text-emerald-800 flex"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98110_1px,transparent_1px),linear-gradient(to_bottom,#10b9810d_1px,transparent_1px)] bg-[size:4.5rem_4.5rem]" />
      </div>

      {/* Back Button */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 text-sm font-mono text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all backdrop-blur-md"
      >
        <ArrowLeft className="w-4 h-4" />
      </Link>

      {/* Left side (hidden on small screens) */}
      <div className="relative hidden w-[45%] lg:flex bg-zinc-950/40 z-10 p-12 overflow-hidden border-r border-white/5">
        <EtherealShadow
          color="rgba(16, 185, 129, 0.15)"
          animation={{ scale: 100, speed: 0.3 }}
          noise={{ opacity: 0.9, scale: 1.2 }}
          className="z-0"
        />

        {/* Centralized staggering wrapper for performance */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="z-10 flex flex-col justify-between h-full w-full"
        >
          <div className="flex-1" />

          {/* Hero content */}
          <div className="flex flex-col justify-center max-w-xl relative">
            <motion.h1
              variants={fadeUpItem}
              className="text-4xl md:text-5xl lg:text-[64px] font-medium leading-[1.1] tracking-tight mb-8 text-white text-left"
            >
              Ship better code, <br />
              <span className="font-serif italic text-emerald-500 font-light tracking-normal">magically faster.</span>
            </motion.h1>

            <motion.p
              variants={fadeUpItem}
              className="text-lg text-white/50 font-light max-w-md text-left leading-relaxed"
            >
              CodeUnicorn transforms your GitHub workflow with autonomous PR reviews, intelligent codebase search, and automated developer analytics.
            </motion.p>

            {/* SaaS "Try it now" CTA block */}
            <motion.div
              variants={fadeUpItem}
              className="mt-8 flex flex-col items-start gap-6"
            >
              <div className="flex flex-col items-center gap-6 w-full max-w-md">
                <div className="group cursor-pointer flex items-center gap-3 px-12 h-14 rounded-full bg-white/90 text-black font-semibold text-base transition-all hover:scale-105 active:scale-95">
                  Try it now
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </div>

                <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px]">
                  <div className="flex items-center gap-1.5 text-white/40">
                    <Check className="w-3.5 h-3.5 text-emerald-500/80" />  No credit card required
                  </div>
                  <div className="flex items-center gap-1.5 text-white/40">
                    <Check className="w-3.5 h-3.5 text-emerald-500/80" /> 1-click connect
                  </div>
                  <div className="flex items-center gap-1.5 text-white/40">
                    <Check className="w-3.5 h-3.5 text-emerald-500/80" /> Free open source
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="flex-1" />

          {/* Bottom Testimonial / Social Proof */}
          <motion.div
            variants={fadeUpItem}
            className="pb-4 pt-8 border-t border-white/5 mt-auto"
          >
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="w-9 h-9 rounded-full border-2 border-background bg-zinc-800 flex items-center justify-center overflow-hidden shadow-lg">
                    <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${i + 15}&backgroundColor=transparent`} alt={`User ${i}`} className="w-full h-full object-cover opacity-90" />
                  </div>
                ))}
              </div>
              <div className="text-sm text-white/50">
                Joined by <span className="text-white font-medium">20+</span> top developers
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Right side - existing login form */}
      <div className="relative flex w-full flex-col items-center justify-center lg:w-[55%] p-6 sm:p-10 z-10 border-l border-white/10">
        <div className="w-full max-w-lg">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_34px_90px_-58px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:p-10">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(140deg,rgba(255,255,255,0.14),transparent_42%,rgba(16,185,129,0.08)_100%)]" />

            <div className="relative text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/20 bg-white p-2 shadow-[0_24px_40px_-28px_rgba(0,0,0,0.95)]">
                <Image
                  src="/code-logo-bg.png"
                  alt="CodeUnicorn Logo"
                  width={100}
                  height={100}
                  className="h-18 w-18 object-contain"
                />
              </div>

              <h1 className="font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                CodeUnicorn
              </h1>
              <p className="mt-3 text-md text-muted-foreground sm:text-base">
                Continue with GitHub to access your account.
              </p>
            </div>

            <div className="relative mt-8">
              <ConnectButton
                onClick={handleGitHubLogin}
                isConnected={false}
                isLoading={loading}
                idleLabel="Continue with GitHub"
                loadingLabel="Continuing..."
                idleIcon={<Github className="h-3.5 w-3.5" />}
                className="w-full"
              />
            </div>

            <p className="relative mt-3 text-center text-xs text-muted-foreground">
              <span className="inline-flex items-start gap-1.5">
                <Sparkles className="h-3 w-3 shrink-0 mt-[2px]" />
                Secure sign-in for repositories, reviews, AI chat, and repo docs.
              </span>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
