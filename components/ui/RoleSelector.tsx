"use client";

import { useRole } from "@/components/providers/RoleProvider";
import type { AppRole } from "@/components/providers/RoleProvider";

const roleLabels: Record<AppRole, string> = {
  admin: "Admin",
  owner: "Owner",
  viewer: "Viewer",
};

const roleColors: Record<AppRole, string> = {
  admin: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
  owner: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  viewer: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
};

export function RoleSelector() {
  const { currentRole, setCurrentRole } = useRole();

  return (
    <div className="relative">
      <select
        value={currentRole}
        onChange={(e) => setCurrentRole(e.target.value as AppRole)}
        className="appearance-none bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 pr-8 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors"
      >
        {Object.entries(roleLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <svg
        className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </div>
  );
}

