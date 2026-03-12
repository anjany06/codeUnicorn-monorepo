import type { Repository } from "./types";

type LanguageTheme = {
  label: string;
  icon: string;
};

function getLanguageTheme(language: Repository["language"]): LanguageTheme {
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
    : cleaned
        .replace(/[^a-zA-Z+#]/g, "")
        .slice(0, 2)
        .toUpperCase();

  return {
    label: cleaned,
    icon: short || "</>",
  };
}

export function LanguageBadge({ language }: { language: Repository["language"] }) {
  const theme = getLanguageTheme(language);

  return (
    <span className="inline-flex items-center gap-2 rounded-lg border border-border/65 bg-linear-to-b from-background/90 to-muted/40 px-2.5 py-1 text-xs font-semibold tracking-[0.02em] text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_8px_16px_-12px_rgba(0,0,0,0.5)]">
      <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-border/70 bg-linear-to-b from-muted to-muted/70 px-1 text-[10px] font-black leading-none text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
        {theme.icon}
      </span>
      <span>{theme.label}</span>
    </span>
  );
}
