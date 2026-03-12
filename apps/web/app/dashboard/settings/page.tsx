"use client";

import React, { useState } from "react";
import { ProfileForm } from "./_components/profile-form";
import { RepositoryList } from "./_components/repository-list";
import { SettingsSection } from "./_components/settings-section";
import { SettingsTabs } from "./_components/settings-tabs";

type SettingsTab = "profile" | "integrations";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground max-w-md">
          Manage your account settings and connected services.
        </p>
      </div>

      <SettingsTabs activeTab={activeTab} onChange={setActiveTab} />

      <div className="border border-border/50 rounded-xl bg-card p-6 md:p-8">
        {activeTab === "profile" && (
          <SettingsSection
            title="Profile Settings"
            description="Update your personal details and public profile."
          >
            <ProfileForm />
          </SettingsSection>
        )}

        {activeTab === "integrations" && (
          <SettingsSection
            title="Integrations"
            description="Manage your connected GitHub repositories."
          >
            <RepositoryList />
          </SettingsSection>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
