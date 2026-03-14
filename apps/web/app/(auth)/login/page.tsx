import LoginUI from "@/components/auth/login-ui";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

const LoginPage = async () => {
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

  return (
    <div>
      <LoginUI />
    </div>
  );
};

export default LoginPage;