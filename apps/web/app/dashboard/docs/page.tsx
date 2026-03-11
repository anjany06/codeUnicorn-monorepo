"use client";

import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  getConnectedRepositories,
  getGeneratedDocs,
  getGeneratedDoc,
  generateDoc,
  getSubscriptionData,
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
  Network,
  Users,
  RefreshCw,
  Download,
  Copy,
  Check,
  Loader2,
  FileText,
} from "lucide-react";

function MermaidDiagram({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setInvalid(false);
    setSvg(null);

    async function render() {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({ startOnLoad: false, theme: "neutral" });
        await mermaid.parse(code);
        const id = `mermaid-${Math.random().toString(36).slice(2)}`;
        const { svg: rendered } = await mermaid.render(id, code);
        if (cancelled) return;
        if (rendered.includes("Syntax error in text")) {
          setInvalid(true);
          return;
        }
        setSvg(rendered);
      } catch {
        if (!cancelled) setInvalid(true);
      }
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [code]);

  if (invalid) {
    return null;
  }

  if (!svg) {
    return (
      <div className="my-4 flex items-center justify-center h-24 rounded-md text-xs text-muted-foreground">
        Rendering diagram…
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="my-4 overflow-x-auto rounded-md border border-border bg-white p-4"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

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

  const { data: subscriptionData } = useQuery({
    queryKey: ["subscription-data"],
    queryFn: getSubscriptionData,
  });
  const isProUser = subscriptionData?.user?.subscriptionTier === "PRO";

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
    <div className="flex flex-col gap-6 p-4 sm:p-6 w-full max-w-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold">Auto-Generated Docs</h1>
        <p className="text-muted-foreground text-md mt-1">
          Use AI to generate documentation for your repositories using the
          indexed codebase
        </p>
      </div>

      {/* Repo selector */}
      <div className="flex items-center gap-3">
        <Select value={selectedRepoId} onValueChange={setSelectedRepoId}>
          <SelectTrigger className="w-full max-w-xs sm:w-[320px]">
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
        <div className="flex flex-col gap-6 min-w-0 w-full max-w-full">
          {/* Doc type cards – horizontal row at the top */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            {DOC_TYPES.map(({ type, label, description, icon }) => {
              const docRecord = getDocStatus(type);
              const isGenerating =
                generateMutation.isPending &&
                generateMutation.variables?.docType === type;
              const isActive = activeDocType === type;
              const isRegenerateLocked =
                docRecord?.status === "completed" && !isProUser;

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
                      disabled={
                        isGenerating ||
                        docRecord?.status === "pending" ||
                        isRegenerateLocked
                      }
                      title={
                        isRegenerateLocked
                          ? "Regenerate is available for Pro users only"
                          : undefined
                      }
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
                          {isRegenerateLocked ? "Regenerate (Pro)" : "Regenerate"}
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

          {/* Markdown viewer – full width below the cards */}
          <Card className="flex flex-col min-w-0 w-full max-w-full overflow-hidden">
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
            <CardContent
              className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6"
              style={{ minHeight: "420px", maxHeight: "70vh" }}
            >
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
                <div className="prose prose-sm dark:prose-invert max-w-full w-full break-words prose-pre:overflow-x-auto prose-img:max-w-full prose-a:text-primary prose-code:before:content-none prose-code:after:content-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code: ({ className, children, ...props }) => {
                        const isMermaid = className === "language-mermaid";
                        if (isMermaid) {
                          return (
                            <MermaidDiagram code={String(children).trim()} />
                          );
                        }
                        const isBlock = className?.includes("language-");
                        return isBlock ? (
                          <code
                            className={`block text-foreground rounded-md px-4 py-3 overflow-x-auto text-xs font-mono whitespace-pre ${className ?? ""}`}
                            {...props}
                          >
                            {children}
                          </code>
                        ) : (
                          <code
                            className="text-foreground rounded px-1.5 py-0.5 text-xs font-mono"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
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
