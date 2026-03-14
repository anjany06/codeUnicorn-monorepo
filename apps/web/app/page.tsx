import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
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

  if (data?.session) {
    redirect("/dashboard");
  }

  redirect("/login");
}