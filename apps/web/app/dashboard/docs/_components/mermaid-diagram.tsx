import React, { useEffect, useRef, useState } from "react";

export function MermaidDiagram({ code }: { code: string }) {
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
        Rendering diagram...
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
