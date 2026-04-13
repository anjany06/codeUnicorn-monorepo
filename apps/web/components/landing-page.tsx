"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Manifesto } from "@/components/landing/manifesto";
import { Features } from "@/components/landing/features";
import { Pulse } from "@/components/landing/pulse";
import { PRAgent } from "@/components/landing/pr-agent";
import { TechnicalProof } from "@/components/landing/technical-proof";
import { TicketPricing } from "@/components/landing/ticket-pricing";
import { FAQ } from "@/components/landing/faq";
import { Footer } from "@/components/landing/footer";
import { usePrewarmBackend } from "@/hooks/use-prewarm-backend";

export function LandingPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const containerRef = useRef<HTMLDivElement>(null);

  // Pre-warm the backend on Render while user browses the landing page
  usePrewarmBackend();

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (!isPending && session?.user) {
      router.replace("/dashboard");
    }
  }, [isPending, session, router]);

  // Setup smooth scroll using Lenis
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
    });

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full bg-background text-foreground overflow-x-hidden selection:bg-primary selection:text-background font-sans">
      <Navbar />
      <Hero />
      <Manifesto />
      <Features />
      <Pulse />
      <PRAgent />
      <TechnicalProof />
      <TicketPricing />
      <FAQ />
      <Footer />
    </div>
  );
}