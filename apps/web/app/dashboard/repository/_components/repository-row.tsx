import { ExternalLink, Github, Star } from "lucide-react";
import { ConnectButton } from "./connect-button";
import { LanguageBadge } from "./language-badge";
import { Repository } from "./types";

type RepositoryRowProps = {
  repo: Repository;
  isConnected: boolean;
  isIndexed: boolean;
  isLoading: boolean;
  onConnect: () => void;
};

export function RepositoryRow({
  repo,
  isConnected,
  isIndexed,
  isLoading,
  onConnect,
}: RepositoryRowProps) {
  return (
    <div className="group flex flex-col gap-3 md:flex-row md:items-center md:justify-between p-4 md:px-5 hover:bg-muted/30 transition-colors">
      <div className="flex flex-col gap-1.5 min-w-0 flex-1">
        <div className="flex items-center gap-2 min-w-0">
          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-sm hover:underline flex items-center gap-2 min-w-0"
          >
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border/70 bg-linear-to-b from-background/90 to-muted/40 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_8px_16px_-12px_rgba(0,0,0,0.5)]">
              <Github className="h-3.5 w-3.5" />
            </span>
            <span className="truncate text-xl">{repo.name}</span>
          </a>

          {isConnected && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-linear-to-b from-white/30 via-white/18 to-white/8 px-2.5 py-1 text-[10px] font-semibold tracking-[0.03em] text-foreground leading-none shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_10px_20px_-14px_rgba(0,0,0,0.65)] backdrop-blur-md shrink-0">
              <span className="h-2 w-1.5 rounded-full bg-foreground/80" />
              Connected
            </span>
          )}
        </div>

        {repo.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 md:line-clamp-1">
            {repo.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1 flex-wrap">
          <LanguageBadge language={repo.language} />
          <span className="inline-flex items-center gap-1.5 rounded-md border border-border/65 bg-linear-to-b from-background/90 to-muted/40 px-2.5 py-1 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_8px_16px_-12px_rgba(0,0,0,0.5)]">
            <Star className="h-3.5 w-3.5 text-foreground/80" />
            <span className="font-semibold tabular-nums">
              {repo.stargazers_count.toLocaleString()}
            </span>
          </span>
        </div>
      </div>

      {isConnected && (
        <div className="hidden lg:flex max-w-sm flex-col gap-1 rounded-lg border border-border/70 bg-muted/30 px-3 py-2 shrink-0">
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.02em]">
            <span
              className={
                isIndexed ? "text-muted-foreground/70" : "text-amber-600"
              }
            >
              Indexing started
            </span>
            <span className="text-muted-foreground/60">-&gt;</span>
            <span
              className={
                isIndexed
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-muted-foreground/65"
              }
            >
              Completed
            </span>
          </div>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            {isIndexed
              ? "Indexing is complete. Reviews now use full repo context."
              : "Please wait for indexing to complete before generating reviews for best accuracy."}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between md:justify-end gap-2 shrink-0">
        <a
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-muted-foreground hover:text-foreground transition-colors md:opacity-0 md:group-hover:opacity-100"
        >
          <ExternalLink className="h-4 w-4" />
        </a>

        <ConnectButton
          isConnected={isConnected}
          isLoading={isLoading}
          onClick={onConnect}
        />
      </div>
    </div>
  );
}
