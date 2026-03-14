"use client";

import React, { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { Github, ShieldCheck, Sparkles } from "lucide-react";
import Image from "next/image";
import { ConnectButton } from "@/app/dashboard/repository/_components/connect-button";

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
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground selection:bg-emerald-600/30 selection:text-emerald-800">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98110_1px,transparent_1px),linear-gradient(to_bottom,#10b9810d_1px,transparent_1px)] bg-[size:4.5rem_4.5rem]" />
        {/* <div className="absolute -top-24 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-emerald-700/12 blur-[130px]" />
        <div className="absolute bottom-0 left-1/2 h-[18rem] w-[18rem] -translate-x-1/2 rounded-full bg-teal-500/10 blur-[120px]" /> */}
      </div>

      <div className="relative flex min-h-screen items-center justify-center p-6 sm:p-10">
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

            {/* <div className="relative mt-6 flex justify-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/25 bg-emerald-400/10 px-3 py-1 text-sm font-semibold text-emerald-100">
                <ShieldCheck className="h-3.5 w-3.5" />
                GITHUB OAUTH
              </span>
            </div> */}

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
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" />
                Secure sign-in for repositories, reviews, AI chat, and repo docs.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
