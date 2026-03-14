import LoginUI from "@/components/auth/login-ui";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

const LoginPage = async () => {
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

  return (
    <div>
      <LoginUI />
    </div>
  );
};

export default LoginPage;