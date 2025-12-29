"use client";

import { createContext, useContext, ReactNode } from "react";
import { useAuth } from "./AuthProvider";

export type AppRole = "admin" | "super_admin" | "viewer";

interface RoleContextType {
  currentRole: AppRole | null;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  // Get role from user object, default to null if not available
  const currentRole = (user?.role as AppRole | null) || null;

  return (
    <RoleContext.Provider value={{ currentRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
