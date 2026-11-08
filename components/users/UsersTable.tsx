"use client";

import { ReactNode } from "react";
import { type OrganizationMember } from "@/lib/api/organizationMembers";
import { useConfirmation } from "@/components/providers/ConfirmationProvider";
import { BUTTON_GHOST, Card, CardHeader } from "@/components/dashboard/dashboardUi";

interface UsersTableProps {
  members: OrganizationMember[];
  onDelete?: (memberId: string) => void;
  onToggleStatus: (userId: string) => void;
  onResendInvitation?: (memberId: string) => void;
  resendingMemberId?: string;
  currentUserId?: string;
  deletingMemberId?: string;
  /** Optional card header. */
  title?: string;
  subtitle?: ReactNode;
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
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function initials(name: string): string {
  const parts = name.replace(/[._-]+/g, " ").trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2);
  return letters.toUpperCase();
}

function RoleBadge({ role }: { role: string }) {
  const isAdmin = role === "admin";
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-1.5 py-0.5 text-[11px] font-medium text-gray-700 dark:border-white/10 dark:text-gray-300">
      {isAdmin ? (
        <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z" />
        </svg>
      ) : null}
      {isAdmin ? "Admin" : "Viewer"}
    </span>
  );
}

function StatusBadge({ status, disabled }: { status: string; disabled: boolean }) {
  const state = disabled
    ? { label: "Disabled", dot: "bg-gray-400" }
    : status === "verified"
      ? { label: "Active", dot: "bg-emerald-500" }
      : { label: "Invite pending", dot: "bg-amber-500" };

  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] text-gray-700 dark:text-gray-300">
      <span className={`h-1.5 w-1.5 rounded-full ${state.dot}`} aria-hidden="true" />
      {state.label}
    </span>
  );
}

export function UsersTable({
  members,
  onDelete,
  onToggleStatus,
  onResendInvitation,
  resendingMemberId,
  currentUserId,
  deletingMemberId,
  title,
  subtitle,
}: UsersTableProps) {
  const { confirm } = useConfirmation();

  const handleDelete = async (memberId: string, email: string) => {
    const confirmed = await confirm({
      title: "Remove user",
      message: `Remove ${email} from your organization? They will lose access immediately.`,
      confirmText: "Remove",
      cancelText: "Cancel",
      variant: "danger",
    });

    if (confirmed && onDelete) {
      onDelete(memberId);
    }
  };

  const header = title ? <CardHeader title={title} subtitle={subtitle} /> : null;

  if (!members || members.length === 0) {
    return (
      <Card>
        {header}
        <div className="flex flex-col items-center px-6 py-16 text-center">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-gray-100 dark:bg-white/[0.06]">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 19v-1a4 4 0 00-4-4H6a4 4 0 00-4 4v1M9 10a3 3 0 100-6 3 3 0 000 6zm13 9v-1a4 4 0 00-3-3.9M16 4.1a3 3 0 010 5.8" />
            </svg>
          </div>
          <p className="mt-3 text-[14px] font-medium text-gray-900 dark:text-white">No team members yet</p>
          <p className="mt-1 text-[13px] text-gray-500 dark:text-gray-400">
            Invite a teammate to give them access.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {header}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60 dark:border-white/[0.06] dark:bg-white/[0.02]">
              {["Member", "Role", "Status", "Last login", ""].map((column, index) => (
                <th
                  key={column || index}
                  scope="col"
                  className="whitespace-nowrap px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500 first:pl-5 last:pr-5 last:text-right dark:text-gray-400"
                >
                  {column || <span className="sr-only">Actions</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/[0.06]">
            {members.map((member) => {
              const user = member.user;
              const displayName = user.fullName || user.email.split("@")[0];
              const isSelf = user.id === currentUserId;

              return (
                <tr
                  key={member.id}
                  className="transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                >
                  <td className="py-3 pl-5 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gray-100 text-[12px] font-semibold text-gray-700 ring-1 ring-gray-200 dark:bg-white/[0.06] dark:text-gray-200 dark:ring-white/10">
                        {initials(displayName)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium text-gray-900 dark:text-white">
                          {displayName}
                          {isSelf ? (
                            <span className="ml-1.5 text-[12px] font-normal text-gray-400">(you)</span>
                          ) : null}
                        </p>
                        <p className="truncate text-[12px] text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <RoleBadge role={member.role} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <StatusBadge status={member.status} disabled={user.disabled} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-[13px] text-gray-500 dark:text-gray-400">
                    {formatLastLogin(user.lastLogin || null)}
                  </td>
                  <td className="py-3 pl-4 pr-5">
                    <div className="flex items-center justify-end gap-1">
                      {member.status === "pending" && onResendInvitation ? (
                        <button
                          type="button"
                          onClick={() => onResendInvitation(member.id)}
                          disabled={Boolean(resendingMemberId)}
                          className={BUTTON_GHOST}
                        >
                          {resendingMemberId === member.id ? "Sending…" : "Resend invite"}
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => onToggleStatus(user.id)}
                        className={BUTTON_GHOST}
                      >
                        {user.disabled ? "Enable" : "Disable"}
                      </button>
                      {onDelete && !isSelf ? (
                        <button
                          type="button"
                          onClick={() => void handleDelete(member.id, user.email)}
                          disabled={Boolean(deletingMemberId)}
                          className={`${BUTTON_GHOST} text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300`}
                        >
                          {deletingMemberId === member.id ? "Removing…" : "Remove"}
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
