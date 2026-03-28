"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getConnectedRepositories } from "@/lib/api";
import { useRepositories } from "./_hooks/use-repositories";
import {
  RepositoryListSkeleton,
  RepositoryRowSkeletons,
} from "./_components/repository-skeleton";
import { useConnectRepository } from "./_hooks/use-connect-repository";
import { RepositoryHeader } from "./_components/repository-header";
import { RepositoryRow } from "./_components/repository-row";
import { ConnectedRepository, Repository } from "./_components/types";

export default function RepositoryPage() {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useRepositories();

  const { data: connectedRepositories = [] } = useQuery<ConnectedRepository[]>({
    queryKey: ["connected-repositories"],
    queryFn: getConnectedRepositories,
    refetchInterval: (query) => {
      const repos = (query.state.data ?? []) as ConnectedRepository[];
      const hasPendingIndexing = repos.some((repo) => !repo.indexedAt);
      return hasPendingIndexing ? 10000 : false;
    },
  });

  const { mutate: connectRepo } = useConnectRepository();
  const [localConnectingId, setLocalConnectingId] = useState<number | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showConnectedOnly, setShowConnectedOnly] = useState(false);
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

  const connectedByGithubId = useMemo(
    () =>
      new Map(
        connectedRepositories.map((repo) => [repo.githubId, repo] as const),
      ),
    [connectedRepositories],
  );

  if (isLoading) {
    return (
      <div className="space-y-6 w-full max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Repositories</h1>
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
    (repo: Repository) => {
      const matchesSearch = repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            repo.full_name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const isConnected = repo.isConnected || connectedByGithubId.has(String(repo.id));

      if (showConnectedOnly && !isConnected) return false;
      return matchesSearch;
    }
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
      <RepositoryHeader
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        showConnectedOnly={showConnectedOnly}
        onShowConnectedOnlyChange={setShowConnectedOnly}
      />

      <div className="border border-border/50 rounded-xl bg-background overflow-hidden">
        <div className="flex flex-col divide-y divide-border/50">
          {filteredRepositories.map((repo: Repository) => {
            const connectedRepo = connectedByGithubId.get(String(repo.id));
            const isConnected = repo.isConnected || !!connectedRepo;
            const isIndexed = Boolean(connectedRepo?.indexedAt);

            return (
              <RepositoryRow
                key={repo.id}
                repo={repo}
                isConnected={isConnected}
                isIndexed={isIndexed}
                isLoading={localConnectingId === repo.id}
                onConnect={() => handleConnect(repo)}
              />
            );
          })}

          {filteredRepositories.length === 0 && (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No repositories found matching your search.
            </div>
          )}

          {isFetchingNextPage && <RepositoryRowSkeletons count={6} />}
        </div>
      </div>

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
