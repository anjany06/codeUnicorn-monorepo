import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type RepositorySelectorProps = {
  selectedRepoId: string;
  repos: Array<{ id: string; fullName?: string; name?: string }>;
  onSelectRepo: (repoId: string) => void;
  onRefresh: () => void;
};

export function RepositorySelector({
  selectedRepoId,
  repos,
  onSelectRepo,
  onRefresh,
}: RepositorySelectorProps) {
  return (
    <div className="flex items-center gap-3">
      <Select value={selectedRepoId} onValueChange={onSelectRepo}>
        <SelectTrigger className="w-full max-w-xs sm:w-[320px]">
          <SelectValue placeholder="Select a repository..." />
        </SelectTrigger>
        <SelectContent>
          {repos.map((repo) => (
            <SelectItem key={repo.id} value={repo.id}>
              {repo.fullName || repo.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedRepoId && (
        <Button variant="ghost" size="icon" onClick={onRefresh} title="Refresh">
          <RefreshCw className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
