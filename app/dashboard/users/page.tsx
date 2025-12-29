"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRole } from "@/components/providers/RoleProvider";
import { LayoutWrapper } from "@/components/ui/LayoutWrapper";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { UsersTable } from "@/components/users/UsersTable";
import { AddUserModal } from "@/components/users/AddUserModal";
import {
  useMyOrganizationMembers,
  useToggleUserDisabled,
  useInviteUser,
} from "@/lib/api/hooks/useOrganizationMembers";
import toast from "react-hot-toast";

export default function UsersPage() {
  const { isAuthenticated, user } = useAuth();
  const { currentRole } = useRole();
  const router = useRouter();

  const {
    data: orgData,
    isLoading,
    error,
  } = useMyOrganizationMembers();
  const toggleDisabled = useToggleUserDisabled();
  const inviteUser = useInviteUser();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    } else if (currentRole === "super_admin") {
      router.push("/owner/users");
    }
  }, [isAuthenticated, currentRole, router]);

  const handleAddUser = async (newUser: {
    email: string;
    role: string;
  }) => {
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

  const handleInviteUser = (userId: string) => {
    // Resend invitation - this would need a separate API endpoint
    toast.success("Invitation resent", {
      icon: "✉️",
    });
  };

  const handleDeleteUser = (userId: string) => {
    // Delete user - this would need a separate API endpoint
    toast.success("User deleted");
  };

  const handleToggleUserStatus = (userId: string) => {
    toggleDisabled.mutate(userId);
  };

  if (!isAuthenticated || currentRole === "super_admin") {
    return null;
  }

  const members = orgData?.members || [];
  const adminCount = members.filter(
    (m) => m.role === "admin" && !m.user.disabled && m.status === "verified"
  ).length;
  const canAddMoreAdmins = adminCount < 3;
  const canAddUsers = currentRole !== "viewer";

  if (isLoading) {
    return (
      <LayoutWrapper>
        <main className="py-8">
          <Section>
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                Loading users...
              </p>
            </div>
          </Section>
        </main>
      </LayoutWrapper>
    );
  }

  if (error) {
    return (
      <LayoutWrapper>
        <main className="py-8">
          <Section>
            <div className="text-center py-12">
              <p className="text-red-500 dark:text-red-400">
                Failed to load users
              </p>
            </div>
          </Section>
        </main>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper>
      <main className="py-8">
        <Section>
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-semibold text-gray-900 dark:text-white mb-2">
                Users
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Manage team members and their access
                {orgData?.organization.name && (
                  <span className="ml-2 text-blue-500">
                    — {orgData.organization.name}
                  </span>
                )}
              </p>
            </div>
            {canAddUsers && (
              <Button onClick={() => setIsAddModalOpen(true)}>Add User</Button>
            )}
          </div>

          {/* Admin Limit Info */}
          <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <span className="font-semibold">{adminCount} of 3</span> admin
                slots used.{" "}
                {canAddMoreAdmins
                  ? "You can add more admins."
                  : "Admin limit reached."}
              </p>
            </div>
          </div>

          {/* Users Table */}
          <UsersTable
            members={members}
            selectedEmail={selectedEmail}
            onEmailClick={setSelectedEmail}
            onInvite={handleInviteUser}
            onDelete={handleDeleteUser}
            onToggleStatus={handleToggleUserStatus}
          />
        </Section>
      </main>

      {/* Add User Modal */}
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
