"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRole } from "@/components/providers/RoleProvider";
import { LayoutWrapper } from "@/components/ui/LayoutWrapper";
import { Section } from "@/components/ui/Section";
import { UsersTable } from "@/components/users/UsersTable";
import { AddUserModal } from "@/components/users/AddUserModal";
import {
  BUTTON_PRIMARY,
  Card,
  MiniStat,
  PageHeader,
} from "@/components/dashboard/dashboardUi";
import {
  useMyOrganizationMembers,
  useToggleUserDisabled,
  useInviteUser,
  useResendInvitation,
  useDeleteOrganizationMember,
} from "@/lib/api/hooks/useOrganizationMembers";
import toast from "react-hot-toast";

const ADMIN_SEATS = 3;

export default function UsersPage() {
  const { isAuthenticated, isAuthLoading, user } = useAuth();
  const { currentRole } = useRole();
  const router = useRouter();

  const { data: orgData, isLoading, error } = useMyOrganizationMembers();
  const toggleDisabled = useToggleUserDisabled();
  const inviteUser = useInviteUser();
  const resendInvitation = useResendInvitation();
  const deleteMember = useDeleteOrganizationMember();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isAuthenticated) {
      router.push("/");
    } else if (currentRole === "super_admin") {
      router.push("/owner/users");
    }
  }, [isAuthLoading, isAuthenticated, currentRole, router]);

  const handleAddUser = async (newUser: { email: string; role: string }) => {
    if (!orgData?.organization.id) {
      toast.error("Organization not found");
      return;
    }

    inviteUser.mutate(
      {
        email: newUser.email,
        role: newUser.role as "admin" | "viewer",
      },
      {
        onSuccess: () => {
          setIsAddModalOpen(false);
        },
      }
    );
  };

  if (isAuthLoading || !isAuthenticated || currentRole === "super_admin") {
    return null;
  }

  const members = orgData?.members || [];
  const adminCount = members.filter(
    (m) => m.role === "admin" && !m.user.disabled && m.status === "verified"
  ).length;
  const activeCount = members.filter((m) => m.status === "verified" && !m.user.disabled).length;
  const pendingCount = members.filter((m) => m.status === "pending").length;
  const canAddMoreAdmins = adminCount < ADMIN_SEATS;
  const canAddUsers = currentRole !== "viewer";

  return (
    <LayoutWrapper>
      <main className="py-6 sm:py-8">
        <Section>
          <PageHeader
            eyebrow="Access"
            title="Team"
            description={
              orgData?.organization.name ? (
                <>
                  Manage who can access{" "}
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    {orgData.organization.name}
                  </span>
                </>
              ) : (
                "Manage team members and their access"
              )
            }
            actions={
              canAddUsers ? (
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  disabled={isLoading || Boolean(error)}
                  className={BUTTON_PRIMARY}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                  </svg>
                  Invite user
                </button>
              ) : undefined
            }
          />

          <div className="mt-6 border-t border-gray-200/80 pt-6 dark:border-white/[0.08]">
            {isLoading ? (
              <div className="space-y-4" aria-busy="true">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {[0, 1, 2].map((i) => (
                    <Card key={i} className="h-[104px] animate-pulse" />
                  ))}
                </div>
                <Card className="h-72 animate-pulse" />
              </div>
            ) : error ? (
              <Card className="px-6 py-12 text-center">
                <p className="text-[14px] font-medium text-gray-900 dark:text-white">
                  Team members could not be loaded
                </p>
                <p className="mt-1 text-[13px] text-gray-500 dark:text-gray-400">
                  Refresh the page to try again.
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <MiniStat
                    label="Members"
                    value={members.length.toLocaleString()}
                    sub={`${activeCount} active`}
                  />
                  <MiniStat
                    label="Admin seats"
                    value={
                      <>
                        {adminCount}
                        <span className="text-[15px] font-medium text-gray-400"> / {ADMIN_SEATS}</span>
                      </>
                    }
                    sub={canAddMoreAdmins ? `${ADMIN_SEATS - adminCount} available` : "All seats in use"}
                  >
                    <div className="mt-2 flex gap-1" aria-hidden="true">
                      {Array.from({ length: ADMIN_SEATS }).map((_, i) => (
                        <span
                          key={i}
                          className={`h-1.5 flex-1 rounded-full ${
                            i < adminCount
                              ? "bg-gray-900 dark:bg-white"
                              : "bg-gray-100 dark:bg-white/[0.08]"
                          }`}
                        />
                      ))}
                    </div>
                  </MiniStat>
                  <MiniStat
                    label="Pending invites"
                    value={pendingCount.toLocaleString()}
                    sub={pendingCount ? "Waiting to be accepted" : "No open invitations"}
                  />
                </div>

                <UsersTable
                  title="Members"
                  subtitle={`${members.length} ${members.length === 1 ? "person" : "people"} in this organization`}
                  members={members}
                  onDelete={currentRole === "admin" ? (id) => deleteMember.mutate(id) : undefined}
                  onToggleStatus={(userId) => toggleDisabled.mutate(userId)}
                  currentUserId={user?.id}
                  deletingMemberId={deleteMember.isPending ? deleteMember.variables : undefined}
                  onResendInvitation={
                    currentRole === "admin" ? (id) => resendInvitation.mutate(id) : undefined
                  }
                  resendingMemberId={resendInvitation.isPending ? resendInvitation.variables : undefined}
                />
              </div>
            )}
          </div>
        </Section>
      </main>

      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddUser}
        existingEmails={members.map((m) => m.user.email)}
        canAddAdmin={canAddMoreAdmins}
        isLoading={inviteUser.isPending}
      />
    </LayoutWrapper>
  );
}
