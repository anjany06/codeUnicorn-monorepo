"use client";

import React from "react";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full p-4 md:p-6 z-50 flex items-center justify-between bg-transparent backdrop-blur-lg md:backdrop-blur-none border-b border-white/5 md:border-transparent text-foreground">
      <div className="flex items-center gap-2">
        <img src="/codeUnicorn-logo.png" alt="CodeUnicorn Logo" className="w-10 h-8 md:w-12 md:h-10 object-contain" />
        <span className="font-heading text-sm tracking-widest uppercase hidden md:inline-block">CodeUnicorn</span>
      </div>
      <div className="flex gap-4 md:gap-6 items-center">
        <a href="#features" className="text-sm font-mono hover:text-emerald-500 transition-colors hidden md:block">Features</a>
        <a href="#pricing" className="text-sm font-mono hover:text-emerald-500 transition-colors hidden md:block">Pricing</a>
        <a href="/login" className="text-xs md:text-sm font-mono hover:text-emerald-500 transition-colors ml-2 md:ml-4">Log In</a>
        <a href="/login" className="text-xs md:text-sm font-mono border border-primary px-3 py-1.5 md:px-4 md:py-2 bg-emerald-600 hover:bg-transparent transition-all rounded-sm uppercase tracking-wider">Get Started</a>
      </div>
    </nav>
  );
}
