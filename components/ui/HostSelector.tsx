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
        aria-label="Host"
        className="w-full min-w-0 max-w-full cursor-pointer appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3.5 pr-10 text-[13px] font-medium text-gray-700 shadow-sm transition-colors hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40 sm:min-w-[13rem] dark:border-white/10 dark:bg-[#111113] dark:text-gray-200 dark:[color-scheme:dark] dark:hover:border-white/20"
      >
        {options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            className="bg-white text-gray-900 dark:bg-[#1c1c1e] dark:text-white"
          >
            {opt.label}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
        aria-hidden="true"
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

