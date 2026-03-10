import React from "react";
import { DashboardShell } from "@/components/dashboard-shell";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  return <DashboardShell>{children}</DashboardShell>;
};

export default DashboardLayout;
