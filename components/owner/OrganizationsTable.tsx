"use client";

import { type Organization } from "@/data/organizations";

interface OrganizationsTableProps {
  organizations: Organization[];
  onManage: (org: Organization) => void;
}

function StatusBadge({ status }: { status: Organization["status"] }) {
  const styles = {
    active: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
    pending: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300",
    suspended: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
    disabled: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function OrganizationsTable({
  organizations,
  onManage,
}: OrganizationsTableProps) {
  if (organizations.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center">
        <svg
          className="w-12 h-12 text-gray-400 mx-auto mb-4"
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
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No organizations found
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Create your first organization to get started
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Organization
              </th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Domains
              </th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Admin Email
              </th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Created
              </th>
              <th className="text-right px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {organizations.map((org) => (
              <tr
                key={org.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {org.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {org.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-wrap gap-1">
                    {org.domains.map((domain, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                      >
                        {domain}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {org.ownerEmail || 
                     org.members?.find(m => m.role === 'admin')?.user?.email || 
                     org.adminEmail || 
                     'N/A'}
                  </span>
                  {org.members?.some(m => m.role === 'admin' && m.status === 'pending') && (
                    <span className="ml-2 text-xs text-yellow-600 dark:text-yellow-400">
                      (Pending)
                    </span>
                  )}
                </td>
                <td className="px-6 py-5">
                  <StatusBadge status={org.status} />
                </td>
                <td className="px-6 py-5">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(org.createdAt)}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center justify-end gap-2">
                    <button className="px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                      View Users
                    </button>
                    <button
                      onClick={() => onManage(org)}
                      className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      Manage
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
