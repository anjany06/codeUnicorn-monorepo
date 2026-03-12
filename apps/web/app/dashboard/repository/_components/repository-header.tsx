import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type RepositoryHeaderProps = {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
};

export function RepositoryHeader({
  searchQuery,
  onSearchQueryChange,
}: RepositoryHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-heading font-semibold">Repositories</h1>
        <p className="text-md text-muted-foreground">
          Manage and connect your GitHub repositories
        </p>
      </div>

      <div className="relative w-full md:w-80 lg:w-96">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search repositories..."
          className="pl-9 h-9"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
        />
      </div>
    </div>
  );
}
