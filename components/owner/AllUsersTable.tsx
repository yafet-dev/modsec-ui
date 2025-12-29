"use client";

import { type Organization } from "@/lib/api/organization";

interface TableUser {
  id: string;
  userId: string;
  email: string;
  name: string;
  organizationId: string;
  role: string;
  status: "active" | "pending" | "disabled";
  lastLogin: string | null;
  hosts: string[];
}

interface AllUsersTableProps {
  users: TableUser[];
  organizations?: Organization[];
}

function formatLastLogin(lastLogin: string | null): string {
  if (!lastLogin) return "Never";
  
  const date = new Date(lastLogin);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    admin: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
    viewer: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
    super_admin: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
        styles[role] || styles.viewer
      }`}
    >
      {role.charAt(0).toUpperCase() + role.slice(1).replace("_", " ")}
    </span>
  );
}

function StatusBadge({ status }: { status: TableUser["status"] }) {
  const styles: Record<string, string> = {
    active: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
    pending: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300",
    disabled: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
  };

  const labels: Record<string, string> = {
    active: "Active",
    pending: "Pending",
    disabled: "Disabled",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

export function AllUsersTable({
  users,
  organizations = [],
}: AllUsersTableProps) {
  const getOrgName = (orgId: string) => {
    if (!orgId) return "No Organization";
    const org = (organizations || []).find((o) => o.id === orgId);
    return org?.name || "Unknown";
  };

  if (users.length === 0) {
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
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No users found
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          No users found for the selected organization
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
                Name
              </th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Email
              </th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Organization
              </th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Role
              </th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Hosts
              </th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Last Login
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {users.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="text-sm font-mono text-gray-600 dark:text-gray-300">
                    {user.email}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {getOrgName(user.organizationId)}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <RoleBadge role={user.role} />
                </td>
                <td className="px-6 py-5">
                  <StatusBadge status={user.status} />
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-wrap gap-1">
                    {user.hosts.length > 0 ? (
                      user.hosts.map((host) => (
                        <span
                          key={host}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                        >
                          {host}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        None
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatLastLogin(user.lastLogin)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

