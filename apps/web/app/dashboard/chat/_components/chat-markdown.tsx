"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Code2 } from "lucide-react";

export function ChatMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
        ul: ({ children }) => <ul className="mb-2 ml-5 list-disc space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="mb-2 ml-5 list-decimal space-y-1">{children}</ol>,
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        strong: ({ children }) => (
          <strong className="font-semibold text-foreground">{children}</strong>
        ),
        a: ({ children, href }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 text-primary hover:text-primary/80"
          >
            {children}
          </a>
        ),
        code: ({ className, children }) => {
          const match = /language-(\w+)/.exec(className || "");
          const language = match?.[1] || "";
          const value = String(children).replace(/\n$/, "");

          if (!match) {
            return (
              <code className="rounded bg-muted px-1.5 py-0.5 text-[13px] font-mono break-all">
                {children}
              </code>
            );
          }

          return (
            <div className="my-3 overflow-hidden rounded-lg border border-border">
              {language && (
                <div className="flex items-center gap-1.5 bg-muted px-3 py-1 font-mono text-xs text-muted-foreground">
                  <Code2 className="h-3 w-3" />
                  {language}
                </div>
              )}
              <pre className="overflow-x-auto bg-muted/50 p-3">
                <code className="whitespace-pre-wrap break-words font-mono text-sm">
                  {value}
                </code>
              </pre>
            </div>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
