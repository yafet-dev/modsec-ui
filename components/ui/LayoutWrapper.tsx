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
  const { isCollapsed } = useSidebar();

  const isSuperAdmin = currentRole === "super_admin";

  // OwnerSidebar is always w-64, regular Sidebar is dynamic
  const sidebarWidth = isSuperAdmin 
    ? "ml-64" 
    : isCollapsed 
      ? "ml-20" 
      : "ml-72";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex">
      {isSuperAdmin ? <OwnerSidebar /> : <Sidebar />}

      <div className={`flex-1 transition-all duration-500 ease-out ${sidebarWidth}`}>
        <nav className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-black/80 backdrop-blur-md sticky top-0 z-50">
          <div className="px-6">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                {user && (
                  <>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.fullName || user.email.split("@")[0]}
                    </span>
                    {currentRole && (
                      <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                        {currentRole === "super_admin"
                          ? "Super Admin"
                          : currentRole.charAt(0).toUpperCase() +
                            currentRole.slice(1)}
                      </span>
                    )}
                  </>
                )}
              </div>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <Button variant="outline" size="sm" onClick={logout}>
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
