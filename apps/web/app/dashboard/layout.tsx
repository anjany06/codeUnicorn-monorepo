import React from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  const res = await fetch(`${protocol}://${host}/api/auth/get-session`, {
    headers: {
      cookie: headersList.get("cookie") ?? "",
    },
    cache: "no-store",
  });

  const data = await res.json();

  if (!data?.session) {
    redirect("/login?callbackUrl=/dashboard");
  }

  return <DashboardShell>{children}</DashboardShell>;
};

export default DashboardLayout;