"use client";

import React, { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { Github, Sparkles, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ConnectButton } from "@/app/dashboard/repository/_components/connect-button";
import { motion } from "framer-motion";
import { EtherealShadow } from "@/components/ui/etheral-shadow";

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
      <div className="relative hidden w-[45%] flex-col items-center justify-center lg:flex bg-background z-10">
        {/* Static EtherealShadow background (speed: 0 disables the swirling animation) */}
        <EtherealShadow
          color="rgba(16, 185, 129, 0.2)"
          animation={{ scale: 100, speed: 0 }}
          noise={{ opacity: 1, scale: 1.2 }}
          className="z-0"
        />

        {/* Hero content - Just text, no dashboard */}
        <div className="text-center z-10 max-w-xl mx-auto flex flex-col items-center relative scale-90 origin-center">
          <div className="inline-flex items-center gap-2 md:gap-3 px-3 py-1.5 md:px-5 md:py-2 rounded-full border border-white/20 bg-white/10 mb-8 text-[10px] md:text-xs font-mono text-white backdrop-blur-md shadow-[0_4px_14px_0_rgba(255,255,255,0.1)]">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
              </span>
              <span className="font-light text-white drop-shadow-md uppercase">Meet CodeUnicorn</span>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-[82px] font-normal leading-tight tracking-tight mb-8">
            GitHub Intelligence <br />
            <span className="font-serif italic text-emerald-600">Platform.</span>
          </h1>
          <p className="text-lg text-foreground/70 font-light max-w-md">
            Enhance GitHub workflows by combining intelligent PR reviews, codebase understanding, and developer analytics into one unified tool.
          </p>
        </div>
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
