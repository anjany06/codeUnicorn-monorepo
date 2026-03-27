"use client";

import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  securityLevel: "loose",
  fontFamily: "inherit",
});

export function MermaidDiagram({ chart }: { chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgStr, setSvgStr] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    if (!chart || !containerRef.current) return;

    const renderDiagram = async () => {
      try {
        setError("");
        // Ensure the chart code isn't wrapped in markdown brackets
        const cleanChart = chart.replace(/```mermaid\n?|```/gi, "").trim();
        
        const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
        const { svg } = await mermaid.render(id, cleanChart);
        
        if (isMounted) {
          setSvgStr(svg);
        }
      } catch (err: any) {
        console.error("Failed to render Mermaid diagram", err);
        if (isMounted) {
          setError(err?.message || "Invalid diagram syntax");
        }
      }
    };

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [chart]);

  if (error) {
    return (
      <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-md text-rose-400 text-sm overflow-auto font-mono">
        <p className="font-semibold mb-2 text-rose-500">Warning: AI generated invalid diagram syntax.</p>
        <div className="mt-4 opacity-70">
          <p className="font-semibold mb-1">Raw Output:</p>
          <pre className="text-xs whitespace-pre-wrap">{chart}</pre>
        </div>
      </div>
    );
  }

  if (!svgStr) {
    return (
      <div className="p-8 flex items-center justify-center text-muted-foreground text-sm font-mono">
        <span className="animate-pulse">Rendering diagram...</span>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="w-full overflow-x-auto flex justify-center py-4"
      dangerouslySetInnerHTML={{ __html: svgStr }}
    />
  );
}
