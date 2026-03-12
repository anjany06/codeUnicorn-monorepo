type SettingsTab = "profile" | "integrations";

type SettingsTabsProps = {
  activeTab: SettingsTab;
  onChange: (tab: SettingsTab) => void;
};

const TABS: Array<{ key: SettingsTab; label: string }> = [
  { key: "profile", label: "Profile" },
  { key: "integrations", label: "Integrations" },
];

export function SettingsTabs({ activeTab, onChange }: SettingsTabsProps) {
  return (
    <div className="border-b border-border">
      <nav className="flex items-center gap-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`relative pb-3 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute left-0 -bottom-[1px] h-[2px] w-full bg-primary rounded-full" />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
