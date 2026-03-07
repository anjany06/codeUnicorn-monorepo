"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  getConnectedRepositories,
  getGeneratedDocs,
  getGeneratedDoc,
  generateDoc,
  type GeneratedDoc,
  type DocType,
} from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Code2,
  Network,
  Users,
  RefreshCw,
  Download,
  Copy,
  Check,
  Loader2,
  FileText,
} from "lucide-react";

const DOC_TYPES: {
  type: DocType;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    type: "readme",
    label: "README",
    description: "Project overview, setup instructions, and usage guide",
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    type: "api-docs",
    label: "API Docs",
    description: "Documented API endpoints, functions, and interfaces",
    icon: <Code2 className="h-5 w-5" />,
  },
  {
    type: "architecture",
    label: "Architecture",
    description: "System design, component relationships, and data flow",
    icon: <Network className="h-5 w-5" />,
  },
  {
    type: "onboarding",
    label: "Onboarding Guide",
    description: "Step-by-step guide for new contributors to get started",
    icon: <Users className="h-5 w-5" />,
  },
];

function StatusBadge({ status }: { status: string }) {
  if (status === "completed")
    return (
      <Badge
        variant="outline"
        className="text-green-600 border-green-500 dark:text-green-400"
      >
        Ready
      </Badge>
    );
  if (status === "pending")
    return (
      <Badge
        variant="outline"
        className="text-yellow-600 border-yellow-500 dark:text-yellow-400"
      >
        Generating…
      </Badge>
    );
  if (status === "failed")
    return (
      <Badge
        variant="outline"
        className="text-red-600 border-red-500 dark:text-red-400"
      >
        Failed
      </Badge>
    );
  return null;
}

export default function DocsPage() {
  const queryClient = useQueryClient();
  const [selectedRepoId, setSelectedRepoId] = useState<string>("");
  const [activeDocType, setActiveDocType] = useState<DocType | null>(null);
  const [copied, setCopied] = useState(false);

  // Load connected repos
  const { data: repos = [] } = useQuery({
    queryKey: ["connected-repositories"],
    queryFn: getConnectedRepositories,
  });

  // Load all docs for selected repo
  const { data: docs = [], refetch: refetchDocs } = useQuery({
    queryKey: ["generated-docs", selectedRepoId],
    queryFn: () => getGeneratedDocs(selectedRepoId),
    enabled: !!selectedRepoId,
    refetchInterval: (query) => {
      const data = query.state.data as GeneratedDoc[] | undefined;
      const hasPending = data?.some((d) => d.status === "pending");
      return hasPending ? 5000 : false;
    },
  });

  // Load active doc content
  const { data: activeDoc, isLoading: isLoadingDoc } = useQuery({
    queryKey: ["generated-doc", selectedRepoId, activeDocType],
    queryFn: () => getGeneratedDoc(selectedRepoId, activeDocType!),
    enabled: !!selectedRepoId && !!activeDocType,
    refetchInterval: (query) => {
      const data = query.state.data as GeneratedDoc | undefined;
      return data?.status === "pending" ? 3000 : false;
    },
  });

  // Generate mutation
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

  function getDocStatus(docType: DocType) {
    return docs.find((d) => d.type === docType);
  }

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
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  const selectedRepo = repos.find((r: any) => r.id === selectedRepoId);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Auto-Generated Docs</h1>
        <p className="text-muted-foreground mt-1">
          Use AI to generate documentation for your repositories using the
          indexed codebase
        </p>
      </div>

      {/* Repo selector */}
      <div className="flex items-center gap-3">
        <Select value={selectedRepoId} onValueChange={setSelectedRepoId}>
          <SelectTrigger className="w-[320px]">
            <SelectValue placeholder="Select a repository…" />
          </SelectTrigger>
          <SelectContent>
            {repos.map((repo: any) => (
              <SelectItem key={repo.id} value={repo.id}>
                {repo.fullName || repo.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedRepoId && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetchDocs()}
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>

      {!selectedRepoId ? (
        <Card className="py-16">
          <CardContent className="flex flex-col items-center gap-3 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/40" />
            <p className="text-muted-foreground">
              Select a repository to get started
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
          {/* Doc type cards */}
          <div className="flex flex-col gap-3">
            {DOC_TYPES.map(({ type, label, description, icon }) => {
              const docRecord = getDocStatus(type);
              const isGenerating =
                generateMutation.isPending &&
                generateMutation.variables?.docType === type;
              const isActive = activeDocType === type;

              return (
                <Card
                  key={type}
                  className={`cursor-pointer transition-colors ${
                    isActive ? "ring-2 ring-primary" : "hover:bg-muted/50"
                  }`}
                  onClick={() => {
                    if (docRecord?.status === "completed") {
                      setActiveDocType(type);
                    }
                  }}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        {icon}
                        {label}
                      </CardTitle>
                      {docRecord && <StatusBadge status={docRecord.status} />}
                    </div>
                    <CardDescription className="text-xs">
                      {description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {docRecord?.updatedAt &&
                      docRecord.status === "completed" && (
                        <p className="text-xs text-muted-foreground mb-2">
                          Last generated{" "}
                          {new Date(docRecord.updatedAt).toLocaleDateString()}
                        </p>
                      )}
                    <Button
                      size="sm"
                      variant={
                        docRecord?.status === "completed"
                          ? "outline"
                          : "default"
                      }
                      className="w-full gap-2"
                      disabled={isGenerating || docRecord?.status === "pending"}
                      onClick={(e) => {
                        e.stopPropagation();
                        generateMutation.mutate({ docType: type });
                      }}
                    >
                      {isGenerating || docRecord?.status === "pending" ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Generating…
                        </>
                      ) : docRecord?.status === "completed" ? (
                        <>
                          <RefreshCw className="h-3 w-3" />
                          Regenerate
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-3 w-3" />
                          Generate
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Markdown viewer */}
          <Card className="min-h-[500px] flex flex-col">
            <CardHeader className="border-b pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {activeDocType
                    ? DOC_TYPES.find((d) => d.type === activeDocType)?.label
                    : "Select a document"}
                </CardTitle>
                {activeDoc?.content && activeDoc.status === "completed" && (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5"
                      onClick={handleCopy}
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5"
                      onClick={handleDownload}
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-6">
              {!activeDocType ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground gap-3">
                  <FileText className="h-10 w-10 opacity-30" />
                  <p className="text-sm">
                    Generate a document and click it to preview
                  </p>
                </div>
              ) : isLoadingDoc ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : activeDoc?.status === "pending" ? (
                <div className="h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <p className="text-sm">Generating documentation…</p>
                  <p className="text-xs opacity-60">
                    This may take 30–60 seconds
                  </p>
                </div>
              ) : activeDoc?.content ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {activeDoc.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  No content available. Try regenerating.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
