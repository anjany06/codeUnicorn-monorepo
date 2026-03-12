import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy, Download, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DocType, GeneratedDoc } from "@/lib/api";
import { MermaidDiagram } from "./mermaid-diagram";

type DocTypeItem = {
  type: DocType;
  label: string;
};

type DocViewerProps = {
  activeDocType: DocType | null;
  activeDoc?: GeneratedDoc;
  isLoadingDoc: boolean;
  copied: boolean;
  docTypes: DocTypeItem[];
  onCopy: () => void;
  onDownload: () => void;
};

export function DocViewer({
  activeDocType,
  activeDoc,
  isLoadingDoc,
  copied,
  docTypes,
  onCopy,
  onDownload,
}: DocViewerProps) {
  return (
    <Card className="flex flex-col min-w-0 w-full max-w-full overflow-hidden">
      <CardHeader className="border-b pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            {activeDocType
              ? docTypes.find((doc) => doc.type === activeDocType)?.label
              : "Select a document"}
          </CardTitle>
          {activeDoc?.content && activeDoc.status === "completed" && (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="gap-1.5" onClick={onCopy}>
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
                onClick={onDownload}
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
            <p className="text-sm">Generate a document and click it to preview</p>
          </div>
        ) : isLoadingDoc ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : activeDoc?.status === "pending" ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm">Generating documentation...</p>
            <p className="text-xs opacity-60">This may take 30-60 seconds</p>
          </div>
        ) : activeDoc?.content ? (
          <div className="prose prose-sm dark:prose-invert max-w-full w-full break-words prose-pre:overflow-x-auto prose-img:max-w-full prose-a:text-primary prose-code:before:content-none prose-code:after:content-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code: ({ className, children, ...props }) => {
                  const isMermaid = className === "language-mermaid";
                  if (isMermaid) {
                    return <MermaidDiagram code={String(children).trim()} />;
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
  );
}
