"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useSidebar } from "@/components/providers/SidebarProvider";

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
  {
    name: "Logs",
    href: "/dashboard/logs",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
  {
    name: "Users",
    href: "/dashboard/users",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme } = useTheme(); // Subscribe to theme changes for re-render
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const isDark = theme === "dark";

  const activeClasses = isDark
    ? "bg-gradient-to-r from-white/95 to-white/85 text-slate-900 shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
    : "bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-[0_12px_40px_rgba(15,23,42,0.25)]";

  const inactiveClasses = isDark
    ? "text-zinc-300 hover:bg-white/[0.06] hover:text-white active:bg-white/[0.10]"
    : "text-slate-600 hover:bg-white hover:text-slate-900 active:bg-slate-50";

  return (
    <aside
      className={`
        flex flex-col h-screen
        ${isCollapsed ? "w-20 px-3" : "w-72 px-6"}
        backdrop-blur-xl
        fixed inset-y-0 left-0 z-40
        ${isDark ? "text-zinc-50" : "text-slate-900"}
        ${
          isDark
            ? "bg-gradient-to-b from-[#050509]/98 via-[#050509]/95 to-[#050509]/98"
            : "bg-gradient-to-b from-white/95 via-white/90 to-white/95"
        }
        transition-all duration-500 ease-out
      `}
    >
      {/* ======= TOP SECTION ======= */}
      <div className="flex-1 flex flex-col">
        {/* Logo section */}
        <div className="flex items-center justify-between pt-8 pb-4">
          {!isCollapsed && (
            <Link href="/dashboard" className="flex items-center justify-center w-full">
              <img src="/Logo-blue.png" alt="Zergaw WAF" className="h-6 w-auto" />
            </Link>
          )}
          {isCollapsed && (
            <Link href="/dashboard" className="flex items-center justify-center w-full">
              <div
                className={`
                  w-9 h-9 rounded-[20px] flex items-center justify-center
                  transition-all duration-500
                  ${
                    isDark
                      ? "bg-white/95 text-slate-900 shadow-[0_4px_20px_rgba(255,255,255,0.1)]"
                      : "bg-slate-900 text-white shadow-[0_4px_20px_rgba(15,23,42,0.2)]"
                  }
                `}
              >
                <span className="text-xs font-semibold tracking-tight">ZW</span>
              </div>
            </Link>
          )}

          {/* Collapse / reveal button */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`
              ml-2 p-1.5 rounded-full transition-all duration-300
              ${
                isDark
                  ? "hover:bg-white/10 active:bg-white/20 text-zinc-400 hover:text-white"
                  : "hover:bg-slate-100 active:bg-slate-200 text-slate-500 hover:text-slate-700"
              }
            `}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className={`flex flex-col space-y-2 mt-12`}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  group flex items-center relative
                  ${isCollapsed ? "justify-center px-0" : "pl-4 pr-3 gap-3"}
                  w-full rounded-2xl py-3 text-sm font-medium
                  transition-all duration-300 ease-out
                  ${isActive ? activeClasses : inactiveClasses}
                  hover:scale-[1.02] active:scale-[0.98]
                `}
              >
                {/* Active indicator on the RIGHT side */}
                {isActive && !isCollapsed && (
                  <div
                    className={`absolute right-0 w-1 h-6 rounded-full mr-3 ${
                      isDark
                        ? "bg-gradient-to-b from-slate-900 to-slate-800"
                        : "bg-gradient-to-b from-white to-slate-100"
                    }`}
                  />
                )}

                {/* Icon */}
                <span
                  className={`
                    relative flex items-center justify-center
                    transition-all duration-300
                  `}
                >
                  {item.icon}
                </span>

                {!isCollapsed && (
                  <span className="font-medium tracking-tight flex-1">
                    {item.name}
                  </span>
                )}

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div
                    className={`
                      absolute left-full ml-3 px-2 py-1 rounded-lg text-xs font-medium
                      opacity-0 group-hover:opacity-100 pointer-events-none
                      transition-opacity duration-200
                      ${
                        isDark
                          ? "bg-slate-900 text-white"
                          : "bg-white text-slate-900 shadow-lg"
                      }
                    `}
                  >
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
