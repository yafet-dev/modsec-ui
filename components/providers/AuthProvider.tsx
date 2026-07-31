"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLogout } from "@/lib/api/hooks/useAuth";
import { authApi } from "@/lib/api/auth";

function readHasToken(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem("modsecurity_auth");
    if (!raw) return false;
    const p = JSON.parse(raw) as { access_token?: string };
    return !!p.access_token;
  } catch {
    return false;
  }
}

interface AuthContextType {
  isAuthenticated: boolean;
  /** True until client mounted and any in-flight /auth/me for a stored token has finished */
  isAuthLoading: boolean;
  user: {
    id: string;
    email: string;
    fullName: string | null;
    role: string | null;
  } | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const queryClient = useQueryClient();
  const logoutMutation = useLogout();

  useEffect(() => {
    setMounted(true);
  }, []);

  const hasToken = mounted && readHasToken();

  const { data: user, isPending, isError } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authApi.getMe(),
    enabled: hasToken,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!isError) return;
    localStorage.removeItem("modsecurity_auth");
    // Protected dashboard queries are tenant scoped by the access token. Drop
    // every cached response before another account can sign in on this browser.
    queryClient.clear();
  }, [isError, queryClient]);

  const isAuthLoading = !mounted || (!!hasToken && isPending);
  const isAuthenticated = !!user && !isError;

  const logout = () => {
    logoutMutation.mutate();
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isAuthLoading,
        user: user ?? null,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
