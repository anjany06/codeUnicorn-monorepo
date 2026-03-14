import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
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

  if (data?.session) {
    redirect("/dashboard");
  }

  redirect("/login");
}