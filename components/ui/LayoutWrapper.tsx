"use client";

import { useRole } from "@/components/providers/RoleProvider";
import { Sidebar } from "./Sidebar";
import { OwnerSidebar } from "./OwnerSidebar";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./Button";
import { useAuth } from "@/components/providers/AuthProvider";
import { useSidebar } from "@/components/providers/SidebarProvider";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const { currentRole } = useRole();
  const { user, logout } = useAuth();
  const { isCollapsed, openMobileNav } = useSidebar();

  const isSuperAdmin = currentRole === "super_admin";

  const sidebarWidth = isSuperAdmin
    ? "lg:ml-64"
    : isCollapsed
      ? "lg:ml-20"
      : "lg:ml-72";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex overflow-x-hidden">
      {isSuperAdmin ? <OwnerSidebar /> : <Sidebar />}

      <div
        className={`flex-1 min-w-0 transition-all duration-500 ease-out ml-0 ${sidebarWidth}`}
      >
        <nav className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-black/80 backdrop-blur-md sticky top-0 z-50">
          <div className="px-3 sm:px-6">
            <div className="flex items-center justify-between gap-2 sm:gap-4 min-h-14 sm:h-16 py-2 sm:py-0">
              <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={openMobileNav}
                  className="lg:hidden shrink-0 p-2 -ml-1 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label="Open menu"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
                {user && (
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-wrap">
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[40vw] sm:max-w-none">
                      {user.fullName || user.email.split("@")[0]}
                    </span>
                    {currentRole && (
                      <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 shrink-0">
                        {currentRole === "super_admin"
                          ? "Super Admin"
                          : currentRole.charAt(0).toUpperCase() +
                            currentRole.slice(1)}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                <ThemeToggle />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="text-xs sm:text-sm whitespace-nowrap px-3 sm:px-4"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {children}
      </div>
    </div>
  );
}
