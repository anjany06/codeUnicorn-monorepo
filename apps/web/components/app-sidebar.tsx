"use client";

import React, { useState, useEffect } from "react";
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
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth-client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  useSidebar,
} from "@/components/ui/sidebar";

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
import Logout from "./auth/logout";
import Image from "next/image";

export const AppSidebar = () => {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const { data: session } = useSession();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

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

  return (
    <Sidebar
      collapsible="icon"
      style={{ "--sidebar-width-icon": "4rem" } as React.CSSProperties}
      className="h-screen flex flex-col overflow-hidden border-r border-border/60 bg-muted/20 backdrop-blur-sm"
    >
      {/* HEADER */}

      <SidebarHeader className="h-16 flex items-center border-b border-border/40 shrink-0 px-3">
        <div className="flex items-center gap-3 w-full">
          <div className="h-9 w-9 rounded-lg bg-white border border-border flex items-center justify-center shrink-0 overflow-hidden">
            <Image
              src="/code-logo-bg.png"
              alt="CodeUnicorn"
              width={28}
              height={28}
              className="object-contain"
            />
          </div>

          <span
            className={`font-semibold text-sm tracking-tight whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
              isCollapsed ? "max-w-0 opacity-0" : "max-w-[200px] opacity-100"
            }`}
          >
            CodeUnicorn
          </span>
        </div>
      </SidebarHeader>

      {/* CONTENT */}

      <SidebarContent className="flex-1 px-2 py-6 space-y-8 overflow-hidden">
        {/* GENERAL */}

        <SidebarGroup>
          <SidebarGroupLabel
            className={`px-2 text-[11px] uppercase tracking-wider text-muted-foreground whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
              isCollapsed
                ? "max-h-0 opacity-0 py-0 mb-0"
                : "max-h-10 opacity-100"
            }`}
          >
            General
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="mt-2 space-y-1">
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    className={`h-10 rounded-lg transition-all duration-300 relative flex items-center ${
                      isCollapsed ? "justify-center px-1" : "px-2 gap-3"
                    } ${
                      isActive(item.url)
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                    }`}
                  >
                    <Link
                      href={item.url}
                      className={`flex items-center w-full ${
                        isCollapsed ? "justify-center" : "gap-3"
                      }`}
                    >
                      {isActive(item.url) && !isCollapsed && (
                        <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-primary" />
                      )}

                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-md shrink-0 transition-colors duration-200 ${
                          isActive(item.url)
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <item.icon size={17} />
                      </div>

                      <span
                        className={`text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
                          isCollapsed
                            ? "max-w-0 opacity-0"
                            : "max-w-[200px] opacity-100"
                        }`}
                      >
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* OTHER */}

        <SidebarGroup>
          <SidebarGroupLabel
            className={`px-2 text-[11px] uppercase tracking-wider text-muted-foreground whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
              isCollapsed
                ? "max-h-0 opacity-0 py-0 mb-0"
                : "max-h-10 opacity-100"
            }`}
          >
            Other
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="mt-2 space-y-1">
              {secondaryNavigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    className={`h-10 rounded-lg transition-all duration-300 flex items-center ${
                      isCollapsed ? "justify-center px-1" : "px-2 gap-3"
                    } ${
                      isActive(item.url)
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                    }`}
                  >
                    <Link
                      href={item.url}
                      className={`flex items-center w-full ${
                        isCollapsed ? "justify-center" : "gap-3"
                      }`}
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-md shrink-0 bg-muted text-muted-foreground">
                        <item.icon size={17} />
                      </div>

                      <span
                        className={`text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
                          isCollapsed
                            ? "max-w-0 opacity-0"
                            : "max-w-[200px] opacity-100"
                        }`}
                      >
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* THEME TOGGLE */}

              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  tooltip={theme === "dark" ? "Light Mode" : "Dark Mode"}
                  className={`h-10 rounded-lg transition-all duration-300 flex items-center text-muted-foreground hover:bg-accent/60 hover:text-foreground ${
                    isCollapsed ? "justify-center px-1" : "px-2 gap-3"
                  }`}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-md shrink-0 bg-muted">
                    {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
                  </div>

                  <span
                    className={`text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
                      isCollapsed
                        ? "max-w-0 opacity-0"
                        : "max-w-[200px] opacity-100"
                    }`}
                  >
                    {theme === "dark" ? "Light Mode" : "Dark Mode"}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* USER CARD */}

      <SidebarFooter className="border-t border-border/40 shrink-0 p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div
              className={`flex items-center gap-3 p-2 rounded-lg hover:bg-accent/60 cursor-pointer transition-all duration-300 ${
                isCollapsed ? "justify-center" : ""
              }`}
            >
              <Avatar className="h-9 w-9 rounded-lg border border-border shrink-0">
                <AvatarImage src={userAvatar || ""} />
                <AvatarFallback className="rounded-lg">
                  {userInitials}
                </AvatarFallback>
              </Avatar>

              <span
                className={`text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
                  isCollapsed
                    ? "max-w-0 opacity-0"
                    : "max-w-[200px] opacity-100"
                }`}
              >
                {userName}
              </span>
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="center"
            side="top"
            sideOffset={10}
            className="w-56 rounded-lg"
          >
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{userName}</span>
                <span className="text-xs text-muted-foreground">
                  {userEmail}
                </span>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <div className="flex items-center gap-2 text-destructive cursor-pointer">
                <LogOut size={16} />
                <Logout>Sign out</Logout>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
