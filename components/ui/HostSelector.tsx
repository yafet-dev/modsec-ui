"use client";

import { hostsData } from "@/data/hosts";

/** A host option, optionally carrying how many logs it has. */
export type HostOption = string | { host: string; count?: number };

interface HostSelectorProps {
  selectedHost: string;
  onHostChange: (hostId: string) => void;
  /**
   * When provided, options are "all" + these hosts. Pass objects to show a log
   * count beside each host. Otherwise uses static hostsData.
   */
  hosts?: HostOption[];
  className?: string;
}

export function HostSelector({
  selectedHost,
  onHostChange,
  hosts,
  className = "",
}: HostSelectorProps) {
  const options = hosts != null
    ? [
        { value: "all", label: "All hosts" },
        ...hosts.map((entry) => {
          const host = typeof entry === "string" ? entry : entry.host;
          const count = typeof entry === "string" ? undefined : entry.count;

          // Selecting a host shows only that host, so the count tells you
          // up front how many rows to expect.
          return {
            value: host,
            label:
              count != null ? `${host} (${count.toLocaleString()})` : host,
          };
        }),
      ]
    : hostsData.map((h) => ({ value: h.id, label: h.domain }));

  return (
    <div className={`relative ${className}`}>
      <select
        value={selectedHost}
        onChange={(e) => onHostChange(e.target.value)}
        className="appearance-none bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors w-full min-w-0 sm:min-w-[12rem] max-w-full"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <svg
        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
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

