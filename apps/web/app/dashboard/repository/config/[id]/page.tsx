"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getConnectedRepositories } from "@/lib/api";
import { ReviewConfigPanel } from "../../_components/review-config-panel";
import { Spinner } from "@/components/ui/spinner";

export default function RepositoryConfigPage() {
  const params = useParams();
  const router = useRouter();
  const repositoryId = params.id as string;

  const { data: repos = [], isLoading } = useQuery({
    queryKey: ["connected-repositories"],
    queryFn: getConnectedRepositories,
  });

  const repo = repos.find((r: any) => r.id === repositoryId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <ReviewConfigPanel
      repositoryId={repositoryId}
      repositoryName={repo?.fullName || "Repository"}
      onBack={() => router.back()}
    />
  );
}
