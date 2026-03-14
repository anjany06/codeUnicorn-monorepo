import React from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const headersList = await headers();
  const cookie = headersList.get("cookie");

  const res = await fetch(
    "/api/auth/get-session",
    {
      headers: {
        cookie: cookie ?? "",
      },
      cache: "no-store",
    }
  );

  const data = await res.json();

  if (!data?.session) {
    redirect("/login?callbackUrl=/dashboard");
  }

  return <DashboardShell>{children}</DashboardShell>;
};

export default DashboardLayout;