"use client";

import { createContext, useContext, ReactNode } from "react";
import { useSession } from "@/lib/auth-client";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession();

  const value: AuthContextType = {
    user: session?.user
      ? {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
        }
      : null,
    isLoading: isPending,
    isAuthenticated: !!session?.user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}