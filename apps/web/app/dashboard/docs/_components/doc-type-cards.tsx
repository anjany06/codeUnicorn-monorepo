import type { ReactNode } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DocType, GeneratedDoc } from "@/lib/api";
import { StatusBadge } from "./status-badge";

type DocTypeItem = {
  type: DocType;
  label: string;
  description: string;
  icon: ReactNode;
};

type DocTypeCardsProps = {
  docTypes: DocTypeItem[];
  docs: GeneratedDoc[];
  activeDocType: DocType | null;
  isProUser: boolean;
  isMutating: boolean;
  pendingType?: DocType;
  onSetActiveDocType: (type: DocType) => void;
  onGenerate: (type: DocType) => void;
};

function getDocStatus(docs: GeneratedDoc[], docType: DocType) {
  return docs.find((doc) => doc.type === docType);
}

export function DocTypeCards({
  docTypes,
  docs,
  activeDocType,
  isProUser,
  isMutating,
  pendingType,
  onSetActiveDocType,
  onGenerate,
}: DocTypeCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {docTypes.map(({ type, label, description, icon }) => {
        const docRecord = getDocStatus(docs, type);
        const isGenerating = isMutating && pendingType === type;
        const isActive = activeDocType === type;
        const isRegenerateLocked = docRecord?.status === "completed" && !isProUser;

        return (
          <Card
            key={type}
            className={`cursor-pointer transition-colors ${
              isActive ? "ring-2 ring-primary" : "hover:bg-muted/50"
            }`}
            onClick={() => {
              if (docRecord?.status === "completed") {
                onSetActiveDocType(type);
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
              <CardDescription className="text-xs">{description}</CardDescription>
            </CardHeader>

            <CardContent>
              {docRecord?.updatedAt && docRecord.status === "completed" && (
                <p className="text-xs text-muted-foreground mb-2">
                  Last generated {new Date(docRecord.updatedAt).toLocaleDateString()}
                </p>
              )}
              <Button
                size="sm"
                variant={docRecord?.status === "completed" ? "outline" : "default"}
                className="w-full gap-2"
                disabled={isGenerating || docRecord?.status === "pending" || isRegenerateLocked}
                title={
                  isRegenerateLocked
                    ? "Regenerate is available for Pro users only"
                    : undefined
                }
                onClick={(event) => {
                  event.stopPropagation();
                  onGenerate(type);
                }}
              >
                {isGenerating || docRecord?.status === "pending" ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Generating...
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
  );
}
