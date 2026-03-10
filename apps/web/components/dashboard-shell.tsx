"use client";

import React, { useEffect, useState } from "react";
import { PanelLeft } from "lucide-react";
import Image from "next/image";
import { AppSidebar } from "@/components/app-sidebar";
import { cn } from "@/lib/utils";

const SIDEBAR_PREF_KEY = "dashboard_sidebar_collapsed";

type DashboardShellProps = {
  children: React.ReactNode;
};

export const DashboardShell = ({ children }: DashboardShellProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(SIDEBAR_PREF_KEY);
    if (stored === "1") setCollapsed(true);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_PREF_KEY, collapsed ? "1" : "0");
  }, [collapsed]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const toggleNav = () => {
    if (window.matchMedia("(min-width: 768px)").matches) {
      setCollapsed((prev) => !prev);
      return;
    }
    setMobileOpen((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div
        className={cn(
          "min-h-screen transition-[padding-left] duration-300 ease-out",
          collapsed ? "md:pl-[92px]" : "md:pl-[290px]"
        )}
      >
        <header className="sticky top-0 z-30 border-b border-border/50 bg-background/90 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex h-10 w-full max-w-7xl items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Toggle navigation"
                onClick={toggleNav}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/65 bg-background text-muted-foreground transition hover:text-foreground"
              >
                <PanelLeft className="h-[18px] w-[18px]" />
              </button>

              <div className="flex items-center gap-2 md:hidden">
                <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-border/70 bg-white">
                  <Image
                    src="/code-logo-bg.png"
                    alt="CodeUnicorn"
                    width={36}
                    height={36}
                    className="h-8 w-8 object-contain"
                  />
                </div>
                {/* <div>
                  <p className="text-sm font-semibold text-foreground">CodeUnicorn</p>
                  <p className="text-[11px] text-muted-foreground">Project Console</p>
                </div> */}
              </div>
            </div>

            {/* <div className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 md:flex">
              <Sparkles className="h-3.5 w-3.5" />
              Modern Workspace
            </div> */}
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
};
