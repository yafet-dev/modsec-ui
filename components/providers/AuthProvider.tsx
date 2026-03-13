"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useGetMe, useLogout } from "@/lib/api/hooks/useAuth";

interface AuthContextType {
  isAuthenticated: boolean;
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { data: user, isLoading } = useGetMe();
  const logoutMutation = useLogout();

  useEffect(() => {
    const storedAuth = localStorage.getItem("modsecurity_auth");
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);
        if (authData.access_token) {
          setIsAuthenticated(true);
        }
      } catch {
        localStorage.removeItem("modsecurity_auth");
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      setIsAuthenticated(true);
    } else if (!isLoading) {
      setIsAuthenticated(false);
    }
  }, [user, isLoading]);

  const logout = () => {
    logoutMutation.mutate();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user: user ?? null, logout }}>
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

