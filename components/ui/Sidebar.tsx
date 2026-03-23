"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useSidebar } from "@/components/providers/SidebarProvider";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";

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
  const { theme } = useTheme();
  const { isCollapsed, setIsCollapsed, isMobileNavOpen, closeMobileNav } =
    useSidebar();
  const isLgUp = useMediaQuery("(min-width: 1024px)");
  /** Icon rail only on large desktop; phone + tablet use Twitter-style full drawer */
  const showCollapsed = isCollapsed && isLgUp;
  const isDark = theme === "dark";

  const activeClasses = isDark
    ? "bg-gradient-to-r from-white/95 to-white/85 text-slate-900 shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
    : "bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-[0_12px_40px_rgba(15,23,42,0.25)]";

  const inactiveClasses = isDark
    ? "text-zinc-300 hover:bg-white/[0.06] hover:text-white active:bg-white/[0.10]"
    : "text-slate-600 hover:bg-white hover:text-slate-900 active:bg-slate-50";

  return (
    <>
      {/* Twitter-style scrim: above app chrome (header is z-50) */}
      {isMobileNavOpen && (
        <button
          type="button"
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-[2px] lg:hidden"
          onClick={closeMobileNav}
          aria-label="Close menu"
        />
      )}
      <aside
        className={`
        flex flex-col
        h-[100dvh] max-lg:h-[100dvh]
        max-lg:w-[min(20rem,100vw)] max-lg:max-w-[100vw] max-lg:px-5 max-lg:shrink-0
        ${showCollapsed ? "lg:w-20 lg:px-3" : "lg:w-72 lg:px-6"}
        max-lg:backdrop-blur-none
        max-lg:border-r max-lg:border-gray-200 dark:max-lg:border-gray-800
        max-lg:bg-white dark:max-lg:bg-[#050509]
        lg:backdrop-blur-xl
        fixed inset-y-0 left-0
        z-[110] lg:z-40
        max-lg:pt-[env(safe-area-inset-top)] max-lg:pb-[env(safe-area-inset-bottom)]
        max-lg:shadow-2xl
        ${isMobileNavOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
        max-lg:transition-transform max-lg:duration-300 max-lg:ease-out
        ${isDark ? "text-zinc-50 lg:text-zinc-50" : "text-slate-900 lg:text-slate-900"}
        ${
          isDark
            ? "lg:bg-gradient-to-b lg:from-[#050509]/98 lg:via-[#050509]/95 lg:to-[#050509]/98"
            : "lg:bg-gradient-to-b lg:from-white/95 lg:via-white/90 lg:to-white/95"
        }
        transition-all duration-500 ease-out
      `}
      >
        <div className="flex-1 flex flex-col min-h-0">
          {/* Phone + tablet: full logo row + close (Twitter-style sheet) */}
          <div className="lg:hidden flex items-center justify-between gap-3 pt-4 pb-4 shrink-0">
            <Link
              href="/dashboard"
              onClick={() => closeMobileNav()}
              className="flex items-center min-w-0"
            >
              <img
                src="/Logo-blue.png"
                alt="Zergaw WAF"
                className="h-7 w-auto"
              />
            </Link>
            <button
              type="button"
              onClick={closeMobileNav}
              className={`
                shrink-0 p-2 rounded-full transition-all duration-300
                ${
                  isDark
                    ? "hover:bg-white/10 active:bg-white/20 text-zinc-300"
                    : "hover:bg-gray-100 active:bg-gray-200 text-gray-600"
                }
              `}
              aria-label="Close menu"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Large desktop: logo / ZW + collapse toggle */}
          <div className="hidden lg:flex items-center gap-2 pt-8 pb-4">
            <div className="flex-1 min-w-0 flex justify-center">
              {!showCollapsed ? (
                <Link
                  href="/dashboard"
                  className="flex items-center justify-center"
                >
                  <img
                    src="/Logo-blue.png"
                    alt="Zergaw WAF"
                    className="h-6 w-auto"
                  />
                </Link>
              ) : (
                <Link href="/dashboard" className="flex items-center justify-center">
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
            </div>

            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`
              shrink-0 p-1.5 rounded-full transition-all duration-300
              ${
                isDark
                  ? "hover:bg-white/10 active:bg-white/20 text-zinc-400 hover:text-white"
                  : "hover:bg-slate-100 active:bg-slate-200 text-slate-500 hover:text-slate-700"
              }
            `}
              aria-label={showCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {showCollapsed ? (
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

          <nav
            className={`flex flex-col space-y-2 mt-4 lg:mt-12 overflow-y-auto flex-1 min-h-0 pb-6`}
          >
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => closeMobileNav()}
                  className={`
                  group flex items-center relative
                  ${showCollapsed ? "justify-center px-0" : "pl-4 pr-3 gap-3"}
                  w-full rounded-2xl py-3 text-sm font-medium
                  transition-all duration-300 ease-out
                  ${isActive ? activeClasses : inactiveClasses}
                  hover:scale-[1.02] active:scale-[0.98]
                `}
                >
                  {isActive && !showCollapsed && (
                    <div
                      className={`absolute right-0 w-1 h-6 rounded-full mr-3 ${
                        isDark
                          ? "bg-gradient-to-b from-slate-900 to-slate-800"
                          : "bg-gradient-to-b from-white to-slate-100"
                      }`}
                    />
                  )}

                  <span
                    className={`
                    relative flex items-center justify-center
                    transition-all duration-300
                  `}
                  >
                    {item.icon}
                  </span>

                  {!showCollapsed && (
                    <span className="font-medium tracking-tight flex-1">
                      {item.name}
                    </span>
                  )}

                  {showCollapsed && (
                    <div
                      className={`
                      absolute left-full ml-3 px-2 py-1 rounded-lg text-xs font-medium
                      opacity-0 group-hover:opacity-100 pointer-events-none
                      transition-opacity duration-200 z-10
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
    </>
  );
}
