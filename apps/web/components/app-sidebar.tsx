"use client";

import React, { useEffect, useState } from "react";
import {
  Github,
  BookOpen,
  Settings,
  Moon,
  Sun,
  LogOut,
  MessageSquare,
  BookMarked,
  Activity,
  CreditCard,
} from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import Image from "next/image";

type AppSidebarProps = {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

export const AppSidebar = ({
  collapsed,
  mobileOpen,
  onCloseMobile,
}: AppSidebarProps) => {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const { data: session } = useSession();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navigation = [
    { title: "Dashboard", url: "/dashboard", icon: Activity },
    { title: "Repositories", url: "/dashboard/repository", icon: Github },
    { title: "Reviews", url: "/dashboard/reviews", icon: BookOpen },
    { title: "AI Chat", url: "/dashboard/chat", icon: MessageSquare },
    { title: "Repo Docs", url: "/dashboard/docs", icon: BookMarked },
  ];

  const secondaryNavigation = [
    { title: "Subscription", url: "/dashboard/subscription", icon: CreditCard },
    { title: "Settings", url: "/dashboard/settings", icon: Settings },
  ];

  const isActive = (url: string) => {
    if (url === "/dashboard") return pathname === url;
    return pathname.startsWith(url);
  };

  if (!mounted || !session) return null;

  const user = session.user;
  const userName = user.name || "Developer";
  const userEmail = user.email || "";
  const userAvatar = user.image || null;

  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const navItemClass = (active: boolean) =>
    cn(
      "group relative flex h-11 w-full items-center rounded-xl border transition-all duration-200",
      collapsed ? "justify-center px-1" : "justify-start gap-3 px-3",
      active
        ? "border-white/5 bg-white/5 text-foreground inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-lg"
        : "border-transparent text-muted-foreground hover:border-white/20 hover:bg-white/8 hover:text-foreground hover:backdrop-blur-md"
    );

  const labelClass = cn(
    "overflow-hidden whitespace-nowrap text-sm font-medium transition-all duration-200",
    collapsed
      ? "max-w-0 -translate-x-1 opacity-0"
      : "max-w-[170px] translate-x-0 opacity-100"
  );

  const sidebarBody = (
    <div className="relative flex h-full flex-col overflow-x-hidden">
      <div className="border-b border-border/60 p-3">
        <div className="flex items-center justify-start">
          <Link
            href="/dashboard"
            onClick={onCloseMobile}
            className={cn(
              "flex items-center rounded-xl border border-border/60 bg-background/85 px-2 py-2 transition-all duration-200",
              collapsed ? "justify-center" : "gap-2.5 pr-3"
            )}
          >
            <div className="flex h-10 w-10 shrink-0 items-center overflow-hidden rounded-lg border border-border/70 bg-white">
              <Image
                src="/code-logo-bg.png"
                alt="CodeUnicorn"
                width={40}
                height={40}
                className="h-9 w-9 object-contain"
              />
            </div>
            <div className={labelClass}>
              <p className="text-sm font-semibold text-foreground">CodeUnicorn</p>
              <p className="text-xs text-muted-foreground">Developer Suite</p>
            </div>
          </Link>
        </div>
      </div>

      <nav className="flex-1 space-y-7 p-3">
        <section className="space-y-2">
          <p
            className={cn(
              "px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground transition-all duration-200",
              collapsed ? "max-h-0 opacity-0" : "max-h-6 opacity-100"
            )}
          >
            General
          </p>
          <ul className="space-y-1.5">
            {navigation.map((item) => {
              const active = isActive(item.url);
              return (
                <li key={item.title}>
                  <Link
                    href={item.url}
                    title={collapsed ? item.title : undefined}
                    onClick={onCloseMobile}
                    className={navItemClass(active)}
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-all duration-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_8px_24px_-18px_rgba(0,0,0,0.65)]",
                        active
                          ? "border-white/5 bg-linear-to-br from-white/6 via-white/14 to-white/8 text-foreground"
                          : "border-white/16 bg-linear-to-br from-white/16 via-white/10 to-transparent text-muted-foreground group-hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-[18px] w-[18px] shrink-0" />
                    </span>
                    <span className={labelClass}>{item.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="space-y-2">
          <p
            className={cn(
              "px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground transition-all duration-200",
              collapsed ? "max-h-0 opacity-0" : "max-h-6 opacity-100"
            )}
          >
            OTHER
          </p>
          <ul className="space-y-1.5">
            {secondaryNavigation.map((item) => {
              const active = isActive(item.url);
              return (
                <li key={item.title}>
                  <Link
                    href={item.url}
                    title={collapsed ? item.title : undefined}
                    onClick={onCloseMobile}
                    className={navItemClass(active)}
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-all duration-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_8px_24px_-18px_rgba(0,0,0,0.65)]",
                        active
                          ? "border-white/5 bg-linear-to-br from-white/6 via-white/14 to-white/8 text-foreground"
                          : "border-white/16 bg-linear-to-br from-white/16 via-white/10 to-transparent text-muted-foreground group-hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-[18px] w-[18px] shrink-0" />
                    </span>
                    <span className={labelClass}>{item.title}</span>
                  </Link>
                </li>
              );
            })}

            <li>
              <button
                type="button"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                title={collapsed ? (theme === "dark" ? "Light Mode" : "Dark Mode") : undefined}
                className={navItemClass(false)}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/16 bg-linear-to-br from-white/16 via-white/10 to-transparent text-muted-foreground transition-all duration-200 group-hover:text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_8px_24px_-18px_rgba(0,0,0,0.65)]">
                  {theme === "dark" ? (
                    <Sun className="h-[18px] w-[18px] shrink-0" />
                  ) : (
                    <Moon className="h-[18px] w-[18px] shrink-0" />
                  )}
                </span>
                <span className={labelClass}>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
              </button>
            </li>
          </ul>
        </section>
      </nav>

      <footer className="border-t border-border/60 p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex w-full items-center rounded-xl border border-border/65 bg-background/75 p-2.5 transition-all duration-200 hover:border-border hover:bg-muted/60",
                collapsed ? "justify-center" : "gap-2.5"
              )}
            >
              <Avatar className="h-9 w-9 shrink-0 rounded-lg border border-border/70">
                <AvatarImage src={userAvatar ?? ""} />
                <AvatarFallback className="rounded-lg">{userInitials}</AvatarFallback>
              </Avatar>
              <div className={cn("text-left", labelClass)}>
                <p className="truncate text-sm font-semibold text-foreground">{userName}</p>
                <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
              </div>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" side="top" sideOffset={10} className="w-56 rounded-xl">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{userName}</span>
                <span className="text-xs text-muted-foreground">{userEmail}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={() =>
                signOut({
                  fetchOptions: {
                    onSuccess: () => router.push("/login"),
                  },
                })
              }
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </footer>
    </div>
  );

  return (
    <>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden overflow-x-hidden border-r border-border/60 bg-gradient-to-b from-background to-muted/20 backdrop-blur md:block",
          "transition-[width] duration-300 ease-out",
          collapsed ? "w-[92px]" : "w-[290px]"
        )}
      >
        {sidebarBody}
      </aside>

      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/50 backdrop-blur-[1px] transition-opacity duration-200 md:hidden",
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onCloseMobile}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[290px] overflow-x-hidden border-r border-zinc-800/80 bg-linear-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-100 md:hidden",
          "transition-transform duration-300 ease-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarBody}
      </aside>
    </>
  );
};
