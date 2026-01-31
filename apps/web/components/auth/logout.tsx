"use client";
import React from "react";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

const Logout = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const router = useRouter();
  return (
    <Button
      className={className}
      onClick={() =>
        signOut({
          fetchOptions: {
            onSuccess: () => {
              router.push("/login");
            },
          },
        })
      }
    >
      {children}
    </Button>
  );
};

export default Logout;
