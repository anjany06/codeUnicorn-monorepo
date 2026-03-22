import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { LandingPage } from "@/components/landing-page";

export default async function Home() {
  let hasSession = false;

  try {
    const headersList = await headers();
    const host = headersList.get("host");
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

    const res = await fetch(`${protocol}://${host}/api/auth/get-session`, {
      headers: {
        cookie: headersList.get("cookie") ?? "",
      },
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.session) {
        hasSession = true;
      }
    }
  } catch (error) {
    // Backend/Proxy might be offline, ignore safely to show the landing page
    console.warn("Could not check session, falling back to landing page.");
  }

  if (hasSession) {
    redirect("/dashboard");
  }

  return <LandingPage />;
}