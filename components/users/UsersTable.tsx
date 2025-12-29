"use client";

import { type OrganizationMember } from "@/lib/api/organizationMembers";
import { Button } from "@/components/ui/Button";

interface UsersTableProps {
  members: OrganizationMember[];
  selectedEmail: string | null;
  onEmailClick: (email: string | null) => void;
  onInvite: (userId: string) => void;
  onDelete: (userId: string) => void;
  onToggleStatus: (userId: string) => void;
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
    admin:
      "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
    viewer: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
        styles[role] || styles.viewer
      }`}
    >
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
}

function StatusBadge({
  status,
  disabled,
}: {
  status: string;
  disabled: boolean;
}) {
  if (disabled) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
        Disabled
      </span>
    );
  }

  const styles: Record<string, string> = {
    verified:
      "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
    pending:
      "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300",
  };

  const labels: Record<string, string> = {
    verified: "Active",
    pending: "Pending",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
        styles[status] || styles.pending
      }`}
    >
      {labels[status] || "Pending"}
    </span>
  );
}

export function UsersTable({
  members,
  selectedEmail,
  onEmailClick,
  onInvite,
  onDelete,
  onToggleStatus,
}: UsersTableProps) {
  if (!members || members.length === 0) {
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
          Add your first team member to get started
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
                Role
              </th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Last Login
              </th>
              <th className="text-right px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {members.map((member) => {
              const user = member.user;
              const isSelected = selectedEmail === user.email;
              const isPending = member.status === "pending";
              const displayName = user.fullName || user.email.split("@")[0];

              return (
                <tr
                  key={member.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {displayName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <button
                      onClick={() =>
                        onEmailClick(isSelected ? null : user.email)
                      }
                      className={`text-sm font-mono transition-colors ${
                        isSelected
                          ? "text-blue-600 dark:text-blue-400 font-semibold"
                          : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                      }`}
                    >
                      {user.email}
                    </button>
                  </td>
                  <td className="px-6 py-5">
                    <RoleBadge role={member.role} />
                  </td>
                  <td className="px-6 py-5">
                    <StatusBadge
                      status={member.status}
                      disabled={user.disabled}
                    />
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatLastLogin(user.lastLogin || null)}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2">
                      {isSelected && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onInvite(user.id)}
                          disabled={!isPending}
                          className="mr-2"
                        >
                          {isPending ? "Resend Invite" : "Invite"}
                        </Button>
                      )}
                      <button
                        onClick={() => onToggleStatus(user.id)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          user.disabled
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                        }`}
                      >
                        {user.disabled ? "Enable" : "Disable"}
                      </button>
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              `Are you sure you want to delete ${user.email}? This action cannot be undone.`
                            )
                          ) {
                            onDelete(user.id);
                          }
                        }}
                        className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
