"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  ReactNode,
} from "react";

interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileNavOpen: boolean;
  openMobileNav: () => void;
  closeMobileNav: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

/** Tailwind `lg` — below this, Twitter-style drawer; fixed rail + collapse from here up. */
const LG_BREAKPOINT = 1024;

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [isMobileNavOpen, setMobileNavOpen] = useState(false);

  const openMobileNav = useCallback(() => setMobileNavOpen(true), []);
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

  useLayoutEffect(() => {
    const syncSidebarWidth = () => {
      const w = window.innerWidth;
      setIsCollapsed(w < LG_BREAKPOINT);
      if (w >= LG_BREAKPOINT) {
        setMobileNavOpen(false);
      }
    };

    syncSidebarWidth();
    window.addEventListener("resize", syncSidebarWidth);
    return () => window.removeEventListener("resize", syncSidebarWidth);
  }, []);

  useEffect(() => {
    if (!isMobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMobileNavOpen]);

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        setIsCollapsed,
        isMobileNavOpen,
        openMobileNav,
        closeMobileNav,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
