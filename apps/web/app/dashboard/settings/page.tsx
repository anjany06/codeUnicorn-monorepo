"use client";

import React, { useState } from "react";
import { ProfileForm } from "./_components/profile-form";
import { RepositoryList } from "./_components/repository-list";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground max-w-md">
          Manage your account settings and connected services.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab("profile")}
            className={`relative pb-3 text-sm font-medium transition-colors ${
              activeTab === "profile"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Profile
            {activeTab === "profile" && (
              <span className="absolute left-0 -bottom-[1px] h-[2px] w-full bg-primary rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("integrations")}
            className={`relative pb-3 text-sm font-medium transition-colors ${
              activeTab === "integrations"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Integrations
            {activeTab === "integrations" && (
              <span className="absolute left-0 -bottom-[1px] h-[2px] w-full bg-primary rounded-full" />
            )}
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="border border-border/50 rounded-xl bg-card p-6 md:p-8">
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-foreground">
                Profile Settings
              </h2>
              <p className="text-sm text-muted-foreground">
                Update your personal details and public profile.
              </p>
            </div>

            <div className="border-t border-border/40 pt-6">
              <ProfileForm />
            </div>
          </div>
        )}

        {activeTab === "integrations" && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-foreground">
                Integrations
              </h2>
              <p className="text-sm text-muted-foreground">
                Manage your connected GitHub repositories.
              </p>
            </div>

            <div className="border-t border-border/40 pt-6">
              <RepositoryList />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
