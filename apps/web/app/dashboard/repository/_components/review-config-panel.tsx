"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Settings2,
  Shield,
  Eye,
  X,
  Plus,
  Save,
  Loader2,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getReviewConfig,
  updateReviewConfig,
  type ReviewConfigData,
} from "@/lib/api";

const FOCUS_AREA_OPTIONS = [
  "security",
  "performance",
  "readability",
  "maintainability",
  "testing",
  "error-handling",
  "best-practices",
  "documentation",
];

interface ReviewConfigPanelProps {
  repositoryId: string;
  repositoryName: string;
  onBack?: () => void;
}

export function ReviewConfigPanel({
  repositoryId,
  repositoryName,
  onBack,
}: ReviewConfigPanelProps) {
  const queryClient = useQueryClient();
  const [ignorePathInput, setIgnorePathInput] = useState("");

  // Form state
  const [formData, setFormData] = useState<ReviewConfigData>({
    language: null,
    focusAreas: [],
    severityThreshold: "low",
    ignorePaths: [],
    customRules: null,
    autoFix: false,
    enabled: true,
  });

  // Fetch existing config
  const { data: config, isLoading } = useQuery({
    queryKey: ["review-config", repositoryId],
    queryFn: () => getReviewConfig(repositoryId),
    enabled: !!repositoryId,
  });

  // Initialize form with loaded config
  useEffect(() => {
    if (config) {
      setFormData({
        language: config.language ?? null,
        focusAreas: config.focusAreas || [],
        severityThreshold: config.severityThreshold || "low",
        ignorePaths: config.ignorePaths || [],
        customRules: config.customRules ?? null,
        autoFix: config.autoFix ?? false,
        enabled: config.enabled ?? true,
      });
    }
  }, [config]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: (data: Partial<ReviewConfigData>) =>
      updateReviewConfig(repositoryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["review-config", repositoryId],
      });
    },
  });

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const toggleFocusArea = (area: string) => {
    setFormData((prev) => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter((a) => a !== area)
        : [...prev.focusAreas, area],
    }));
  };

  const addIgnorePath = () => {
    const path = ignorePathInput.trim();
    if (path && !formData.ignorePaths.includes(path)) {
      setFormData((prev) => ({
        ...prev,
        ignorePaths: [...prev.ignorePaths, path],
      }));
      setIgnorePathInput("");
    }
  };

  const removeIgnorePath = (path: string) => {
    setFormData((prev) => ({
      ...prev,
      ignorePaths: prev.ignorePaths.filter((p) => p !== path),
    }));
  };

  const handleIgnoreKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addIgnorePath();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Settings2 className="h-6 w-6" />
            Review Configuration
          </h2>
          <p className="text-sm text-muted-foreground">{repositoryName}</p>
        </div>
      </div>

      {/* Master toggle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base">AI Reviews</CardTitle>
              <CardDescription>
                Enable or disable AI code reviews for this repository
              </CardDescription>
            </div>
            <Switch
              checked={formData.enabled}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, enabled: checked }))
              }
            />
          </div>
        </CardHeader>
      </Card>

      {/* Review settings (collapsed if disabled) */}
      <div
        className={`space-y-6 transition-opacity ${
          formData.enabled ? "opacity-100" : "opacity-50 pointer-events-none"
        }`}
      >
        {/* Language & Severity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="h-4 w-4" />
              General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language">Primary Language</Label>
                <Input
                  id="language"
                  placeholder="Auto-detect (leave empty)"
                  value={formData.language || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      language: e.target.value || null,
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Hint the AI about the repository&apos;s main language
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="severity">Severity Threshold</Label>
                <Select
                  value={formData.severityThreshold}
                  onValueChange={(val: "low" | "medium" | "high") =>
                    setFormData((prev) => ({
                      ...prev,
                      severityThreshold: val,
                    }))
                  }
                >
                  <SelectTrigger id="severity" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low — Show all findings</SelectItem>
                    <SelectItem value="medium">
                      Medium — Skip minor issues
                    </SelectItem>
                    <SelectItem value="high">
                      High — Only critical issues
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Focus areas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Focus Areas
            </CardTitle>
            <CardDescription>
              Select which aspects the AI should focus on during reviews
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {FOCUS_AREA_OPTIONS.map((area) => (
                <Badge
                  key={area}
                  variant={
                    formData.focusAreas.includes(area) ? "default" : "outline"
                  }
                  className="cursor-pointer select-none transition-colors hover:bg-primary/80"
                  onClick={() => toggleFocusArea(area)}
                >
                  {area}
                </Badge>
              ))}
            </div>
            {formData.focusAreas.length === 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                No areas selected — the AI will cover all aspects equally
              </p>
            )}
          </CardContent>
        </Card>

        {/* Ignore paths */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ignore Paths</CardTitle>
            <CardDescription>
              Glob patterns for files to skip during reviews (e.g.,{" "}
              <code className="text-xs bg-muted px-1 rounded">
                **/*.test.ts
              </code>
              , <code className="text-xs bg-muted px-1 rounded">dist/**</code>)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={ignorePathInput}
                onChange={(e) => setIgnorePathInput(e.target.value)}
                onKeyDown={handleIgnoreKeyDown}
                placeholder="Add a glob pattern..."
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={addIgnorePath}
                disabled={!ignorePathInput.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.ignorePaths.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.ignorePaths.map((path) => (
                  <Badge key={path} variant="secondary" className="gap-1 pr-1">
                    <code className="text-xs">{path}</code>
                    <button
                      onClick={() => removeIgnorePath(path)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Custom rules */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Custom Rules</CardTitle>
            <CardDescription>
              Add custom instructions for the AI reviewer (e.g., &quot;Always
              check for SQL injection&quot;, &quot;Enforce camelCase
              naming&quot;)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.customRules || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  customRules: e.target.value || null,
                }))
              }
              placeholder="Enter custom review rules..."
              className="min-h-[100px]"
            />
          </CardContent>
        </Card>

        {/* Auto-fix suggestions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Auto-fix Suggestions
                </CardTitle>
                <CardDescription>
                  Include code fix suggestions in inline comments
                </CardDescription>
              </div>
              <Switch
                checked={formData.autoFix}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, autoFix: checked }))
                }
              />
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="gap-2"
        >
          {saveMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Configuration
        </Button>
      </div>

      {/* Success feedback */}
      {saveMutation.isSuccess && (
        <p className="text-sm text-green-600 dark:text-green-400 text-right">
          Configuration saved successfully!
        </p>
      )}
    </div>
  );
}
