import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type RepositoryHeaderProps = {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  showConnectedOnly: boolean;
  onShowConnectedOnlyChange: (checked: boolean) => void;
};

export function RepositoryHeader({
  searchQuery,
  onSearchQueryChange,
  showConnectedOnly,
  onShowConnectedOnlyChange,
}: RepositoryHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-heading font-semibold">Repositories</h1>
        <p className="text-md text-muted-foreground">
          Manage and connect your GitHub repositories
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="connected-only"
            checked={showConnectedOnly}
            onCheckedChange={onShowConnectedOnlyChange}
          />
          <Label htmlFor="connected-only" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 whitespace-nowrap">
            Connected Only
          </Label>
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
    </div>
  );
}
