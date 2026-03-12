import React from "react";

type SettingsSectionProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function SettingsSection({
  title,
  description,
  children,
}: SettingsSectionProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="border-t border-border/40 pt-6">{children}</div>
    </div>
  );
}
