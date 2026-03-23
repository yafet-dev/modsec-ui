"use client";

import {
  createContext,
  useContext,
  useState,
  useLayoutEffect,
  ReactNode,
} from "react";
import { useAuth } from "./AuthProvider";

export type AppRole = "admin" | "super_admin" | "viewer";

interface RoleContextType {
  currentRole: AppRole | null;
  setCurrentRole: (role: AppRole | null) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currentRole, setCurrentRole] = useState<AppRole | null>(
    (user?.role as AppRole | null) || null
  );

  // useLayoutEffect so role is synced before child useEffect redirects (avoids / ↔ /dashboard flicker)
  useLayoutEffect(() => {
    setCurrentRole((user?.role as AppRole | null) || null);
  }, [user?.role]);

  return (
    <RoleContext.Provider value={{ currentRole, setCurrentRole }}>
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
