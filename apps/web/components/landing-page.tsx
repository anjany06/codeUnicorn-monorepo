"use client";

import React, { useEffect, useRef } from "react";

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

export function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Setup smooth scroll feeling natively as instructed by generic lenis usage
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
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