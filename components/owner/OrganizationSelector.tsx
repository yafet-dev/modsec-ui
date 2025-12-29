"use client";

import { type Organization } from "@/lib/api/organization";

interface OrganizationSelectorProps {
  selectedOrg: string;
  onOrgChange: (orgId: string) => void;
  organizations?: Organization[];
}

export function OrganizationSelector({
  selectedOrg,
  onOrgChange,
  organizations = [],
}: OrganizationSelectorProps) {
  const allOrgs = [
    { id: "all", name: "All Organizations" },
    ...(organizations || []).map((org) => ({ id: org.id, name: org.name })),
  ];

  return (
    <div className="relative">
      <select
        value={selectedOrg}
        onChange={(e) => onOrgChange(e.target.value)}
        className="appearance-none bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors min-w-[200px]"
      >
        {allOrgs.map((org) => (
          <option key={org.id} value={org.id}>
            {org.name}
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

