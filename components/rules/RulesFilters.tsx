"use client";

import { useRole } from "@/components/providers/RoleProvider";
import { Button } from "@/components/ui/Button";

interface RulesFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  severityFilter: string;
  onSeverityChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  onAddRule?: () => void;
}

export function RulesFilters({
  searchQuery,
  onSearchChange,
  severityFilter,
  onSeverityChange,
  statusFilter,
  onStatusChange,
  onAddRule,
}: RulesFiltersProps) {
  const { currentRole } = useRole();
  const canAddRule = currentRole === "super_admin" || currentRole === "admin";

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search rules..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Severity Filter */}
        <div className="relative">
          <select
            value={severityFilter}
            onChange={(e) => onSeverityChange(e.target.value)}
            className="appearance-none px-4 py-3 pr-10 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer min-w-[160px]"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
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

        {/* Status Filter */}
        <div className="flex bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
          <button
            onClick={() => onStatusChange("all")}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              statusFilter === "all"
                ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            All Status
          </button>
          <button
            onClick={() => onStatusChange("enabled")}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              statusFilter === "enabled"
                ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Enabled
          </button>
          <button
            onClick={() => onStatusChange("disabled")}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              statusFilter === "disabled"
                ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Disabled
          </button>
        </div>
      </div>
      {canAddRule && onAddRule && (
        <div className="flex justify-end">
          <Button onClick={onAddRule} size="sm">
            <svg
              className="w-4 h-4 mr-2 inline"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Custom Rule
          </Button>
        </div>
      )}
    </div>
  );
}
