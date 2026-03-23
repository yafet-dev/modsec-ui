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

const ownerNavItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/owner/dashboard",
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
    name: "Organizations",
    href: "/owner/organizations",
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
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
  },
  {
    name: "All Logs",
    href: "/owner/logs",
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
    name: "All Rules",
    href: "/owner/rules",
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
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
  },
  {
    name: "All Users",
    href: "/owner/users",
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
];

export function OwnerSidebar() {
  const pathname = usePathname();
  useTheme();
  const { isMobileNavOpen, closeMobileNav } = useSidebar();

  return (
    <>
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
        w-64 h-[100dvh] max-lg:w-[min(20rem,100vw)] max-lg:max-w-[100vw]
        bg-white dark:bg-gray-900
        max-lg:border-r max-lg:border-gray-200 dark:max-lg:border-gray-800
        fixed left-0 top-0 flex flex-col
        z-[110] lg:z-40
        max-lg:pt-[env(safe-area-inset-top)] max-lg:pb-[env(safe-area-inset-bottom)]
        max-lg:shadow-2xl
        ${isMobileNavOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
        lg:border-r lg:border-gray-200 lg:dark:border-gray-800
        max-lg:transition-transform max-lg:duration-300 max-lg:ease-out
      `}
      >
        <div className="p-4 lg:p-6 border-b border-gray-200 dark:border-gray-800 flex items-start justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <img
              src="/Logo-blue.png"
              alt="Zergaw WAF"
              className="h-8 w-auto mb-2"
            />
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Owner Portal
            </p>
          </div>
          <button
            type="button"
            onClick={closeMobileNav}
            className="lg:hidden shrink-0 p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
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

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto min-h-0 custom-scroll scroll-light dark:scroll-dark">
          {ownerNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => closeMobileNav()}
                className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                ${
                  isActive
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 font-medium"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                }
              `}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
