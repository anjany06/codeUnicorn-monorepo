"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { ExternalLink, Star, Search, Github } from "lucide-react";
import { useRepositories } from "./_hooks/use-repositories";
import {
  RepositoryListSkeleton,
  RepositoryRowSkeletons,
} from "./_components/repository-skeleton";
import { useConnectRepository } from "./_hooks/use-connect-repository";
import { ConnectButton } from "./_components/connect-button";

interface Repository {
  id: number;
  name: string;
  owner: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  topics: string[];
  isConnected: boolean;
}

type LanguageTheme = {
  label: string;
  icon: string;
};

function getLanguageTheme(language: string | null): LanguageTheme {
  if (!language) {
    return { label: "Unknown", icon: "</>" };
  }

  const cleaned = language.trim();
  const normalized = cleaned.toLowerCase();
  const languageIconMap: Record<string, string> = {
    javascript: "JS",
    typescript: "TS",
    python: "PY",
    java: "JV",
    go: "GO",
    rust: "RS",
    ruby: "RB",
    php: "PHP",
    swift: "SW",
    kotlin: "KT",
    html: "HT",
    css: "CS",
    shell: "SH",
    bash: "SH",
    zsh: "SH",
    "c#": "C#",
    "c++": "C+",
    "objective-c": "OC",
    "objective-c++": "OC",
  };

  const mappedIcon = languageIconMap[normalized];
  const short = mappedIcon
    ? mappedIcon
    : cleaned.replace(/[^a-zA-Z+#]/g, "").slice(0, 2).toUpperCase();
  return {
    label: cleaned,
    icon: short || "</>",
  };
}

function LanguageBadge({ language }: { language: string | null }) {
  const theme = getLanguageTheme(language);

  return (
    <span
      className="inline-flex items-center gap-2 rounded-lg border border-border/65 bg-linear-to-b from-background/90 to-muted/40 px-2.5 py-1 text-xs font-semibold tracking-[0.02em] text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_8px_16px_-12px_rgba(0,0,0,0.5)]"
    >
      <span
        className="inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-border/70 bg-linear-to-b from-muted to-muted/70 px-1 text-[10px] font-black leading-none text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]"
      >
        {theme.icon}
      </span>
      <span>{theme.label}</span>
    </span>
  );
}

export default function RepositoryPage() {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useRepositories();

  const { mutate: connectRepo } = useConnectRepository();

  const [localConnectingId, setLocalConnectingId] = useState<number | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const observerTarget = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) observer.observe(currentTarget);

    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="space-y-6 w-full max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Repositories
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage and connect your GitHub repositories
            </p>
          </div>
        </div>

        <RepositoryListSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-sm text-destructive">
        Failed to load repositories...
      </div>
    );
  }

  const allRepositories = data?.pages.flatMap((page) => page) || [];

  const filteredRepositories = allRepositories.filter(
    (repo: Repository) =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.full_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleConnect = (repo: Repository) => {
    setLocalConnectingId(repo.id);

    connectRepo(
      {
        owner: repo.owner,
        repo: repo.name,
        githubId: repo.id,
      },
      {
        onSettled: () => setLocalConnectingId(null),
      },
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-10 px-4 sm:px-6">
      {/* Header */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-heading font-semibold">
            Repositories
          </h1>

          <p className="text-md text-muted-foreground">
            Manage and connect your GitHub repositories
          </p>
        </div>

        <div className="relative w-full md:w-80 lg:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />

          <Input
            placeholder="Search repositories..."
            className="pl-9 h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Repository List */}

      <div className="border border-border/50 rounded-xl bg-background overflow-hidden">
        <div className="flex flex-col divide-y divide-border/50">
          {filteredRepositories.map((repo: Repository) => (
            <div
              key={repo.id}
              className="group flex flex-col gap-3 md:flex-row md:items-center md:justify-between p-4 md:px-5 hover:bg-muted/30 transition-colors"
            >
              {/* Repo Info */}

              <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2 min-w-0">
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-sm hover:underline flex items-center gap-2 min-w-0"
                  >
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border/70 bg-linear-to-b from-background/90 to-muted/40 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_8px_16px_-12px_rgba(0,0,0,0.5)]">
                      <Github className="h-3.5 w-3.5" />
                    </span>

                    <span className="truncate text-xl">{repo.name}</span>
                  </a>

                  {repo.isConnected && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-linear-to-b from-white/30 via-white/18 to-white/8 px-2.5 py-1 text-[10px] font-semibold tracking-[0.03em] text-foreground leading-none shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_10px_20px_-14px_rgba(0,0,0,0.65)] backdrop-blur-md shrink-0">
                      <span className="h-2 w-1.5 rounded-full bg-foreground/80 " />
                      Connected
                    </span>
                  )}
                </div>

                {repo.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 md:line-clamp-1">
                    {repo.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1 flex-wrap">
                  <LanguageBadge language={repo.language} />

                  <span className="inline-flex items-center gap-1.5 rounded-md border border-border/65 bg-linear-to-b from-background/90 to-muted/40 px-2.5 py-1 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_8px_16px_-12px_rgba(0,0,0,0.5)]">
                    <Star className="h-3.5 w-3.5 text-foreground/80" />
                    <span className="font-semibold tabular-nums">
                      {repo.stargazers_count.toLocaleString()}
                    </span>
                  </span>
                </div>
              </div>

              {/* Actions */}

              <div className="flex items-center justify-between md:justify-end gap-2 shrink-0">
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors md:opacity-0 md:group-hover:opacity-100"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>

                <ConnectButton
                  isConnected={repo.isConnected}
                  isLoading={localConnectingId === repo.id}
                  onClick={() => handleConnect(repo)}
                />
              </div>
            </div>
          ))}

          {filteredRepositories.length === 0 && (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No repositories found matching your search.
            </div>
          )}

          {/* Inline skeleton rows when loading next page — no gap, no extra border */}
          {isFetchingNextPage && <RepositoryRowSkeletons count={6} />}
        </div>
      </div>

      {/* Infinite Scroll trigger */}
      <div ref={observerTarget} className="flex flex-col items-center w-full">
        {!hasNextPage && allRepositories.length > 0 && (
          <p className="text-sm text-muted-foreground">
            You have reached the end of the list.
          </p>
        )}
      </div>
    </div>
  );
}
