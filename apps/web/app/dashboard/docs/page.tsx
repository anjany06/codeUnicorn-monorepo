"use client";

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  generateDoc,
  getConnectedRepositories,
  getGeneratedDoc,
  getGeneratedDocs,
  getSubscriptionData,
  type DocType,
  type GeneratedDoc,
} from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { DOC_TYPES } from "./_components/doc-types";
import { DocTypeCards } from "./_components/doc-type-cards";
import { DocViewer } from "./_components/doc-viewer";
import { RepositorySelector } from "./_components/repository-selector";

export default function DocsPage() {
  const queryClient = useQueryClient();
  const [selectedRepoId, setSelectedRepoId] = useState<string>("");
  const [activeDocType, setActiveDocType] = useState<DocType | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: subscriptionData } = useQuery({
    queryKey: ["subscription-data"],
    queryFn: getSubscriptionData,
  });
  const isProUser = subscriptionData?.user?.subscriptionTier === "PRO";

  const { data: repos = [] } = useQuery({
    queryKey: ["connected-repositories"],
    queryFn: getConnectedRepositories,
  });

  const { data: docs = [], refetch: refetchDocs } = useQuery({
    queryKey: ["generated-docs", selectedRepoId],
    queryFn: () => getGeneratedDocs(selectedRepoId),
    enabled: !!selectedRepoId,
    refetchInterval: (query) => {
      const data = query.state.data as GeneratedDoc[] | undefined;
      const hasPending = data?.some((doc) => doc.status === "pending");
      return hasPending ? 5000 : false;
    },
  });

  const { data: activeDoc, isLoading: isLoadingDoc } = useQuery({
    queryKey: ["generated-doc", selectedRepoId, activeDocType],
    queryFn: () => getGeneratedDoc(selectedRepoId, activeDocType!),
    enabled: !!selectedRepoId && !!activeDocType,
    refetchInterval: (query) => {
      const data = query.state.data as GeneratedDoc | undefined;
      return data?.status === "pending" ? 3000 : false;
    },
  });

  const generateMutation = useMutation({
    mutationFn: ({ docType }: { docType: DocType }) =>
      generateDoc(selectedRepoId, docType),
    onSuccess: (_, { docType }) => {
      queryClient.invalidateQueries({
        queryKey: ["generated-docs", selectedRepoId],
      });
      queryClient.invalidateQueries({
        queryKey: ["generated-doc", selectedRepoId, docType],
      });
      setActiveDocType(docType);
    },
  });

  function handleCopy() {
    if (activeDoc?.content) {
      navigator.clipboard.writeText(activeDoc.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleDownload() {
    if (!activeDoc?.content) return;
    const ext = activeDocType === "architecture" ? "md" : "md";
    const filename = `${activeDocType}.${ext}`;
    const blob = new Blob([activeDoc.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 w-full max-w-full">
      <div>
        <h1 className="text-2xl font-heading font-bold">Auto-Generated Docs</h1>
        <p className="text-muted-foreground text-md mt-1">
          Use AI to generate documentation for your repositories using the indexed
          codebase
        </p>
      </div>

      <RepositorySelector
        selectedRepoId={selectedRepoId}
        repos={repos}
        onSelectRepo={setSelectedRepoId}
        onRefresh={refetchDocs}
      />

      {!selectedRepoId ? (
        <Card className="py-16">
          <CardContent className="flex flex-col items-center gap-3 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/40" />
            <p className="text-muted-foreground">Select a repository to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-6 min-w-0 w-full max-w-full">
          <DocTypeCards
            docTypes={DOC_TYPES}
            docs={docs as GeneratedDoc[]}
            activeDocType={activeDocType}
            isProUser={isProUser}
            isMutating={generateMutation.isPending}
            pendingType={generateMutation.variables?.docType}
            onSetActiveDocType={setActiveDocType}
            onGenerate={(docType) => generateMutation.mutate({ docType })}
          />

          <DocViewer
            activeDocType={activeDocType}
            activeDoc={activeDoc as GeneratedDoc | undefined}
            isLoadingDoc={isLoadingDoc}
            copied={copied}
            docTypes={DOC_TYPES}
            onCopy={handleCopy}
            onDownload={handleDownload}
          />
        </div>
      )}
    </div>
  );
}
