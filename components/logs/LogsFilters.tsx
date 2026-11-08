"use client";

import { ReactNode } from "react";

interface LogsFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  severityFilter: string;
  onSeverityChange: (value: string) => void;
  actionFilter: string;
  onActionChange: (value: string) => void;
  /** Extra controls placed at the end of the row, such as a host selector. */
  children?: ReactNode;
  className?: string;
}

const CONTROL =
  "h-9 rounded-lg border border-gray-200 bg-white text-[13px] text-gray-900 shadow-sm transition-colors hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-white/10 dark:bg-[#111113] dark:text-gray-100 dark:hover:border-white/20";

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="relative w-full sm:w-auto">
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${CONTROL} w-full cursor-pointer appearance-none pl-3 pr-9 font-medium sm:min-w-[150px] dark:[color-scheme:dark]`}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-white text-gray-900 dark:bg-[#1c1c1e] dark:text-white"
          >
            {option.label}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}

export function LogsFilters({
  searchQuery,
  onSearchChange,
  severityFilter,
  onSeverityChange,
  actionFilter,
  onActionChange,
  children,
  className = "mb-6",
}: LogsFiltersProps) {
  return (
    <div className={`flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center ${className}`}>
      <div className="relative min-w-0 flex-1 sm:min-w-[240px]">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5-5m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="search"
          aria-label="Search logs"
          placeholder="Search URI, IP or rule ID"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className={`${CONTROL} w-full pl-9 pr-3 placeholder:text-gray-400 dark:placeholder:text-gray-500`}
        />
      </div>

      <FilterSelect
        label="Severity"
        value={severityFilter}
        onChange={onSeverityChange}
        options={[
          { value: "all", label: "All severities" },
          { value: "critical", label: "Critical" },
          { value: "high", label: "High" },
          { value: "medium", label: "Medium" },
          { value: "low", label: "Low" },
        ]}
      />

      <FilterSelect
        label="Action"
        value={actionFilter}
        onChange={onActionChange}
        options={[
          { value: "all", label: "All actions" },
          { value: "blocked", label: "Blocked" },
          { value: "warning", label: "Allowed" },
        ]}
      />

      {children}
    </div>
  );
}
