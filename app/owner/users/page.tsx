"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRole } from "@/components/providers/RoleProvider";
import { LayoutWrapper } from "@/components/ui/LayoutWrapper";
import { Section } from "@/components/ui/Section";
import { OrganizationSelector } from "@/components/owner/OrganizationSelector";
import { AllUsersTable } from "@/components/owner/AllUsersTable";
import { useAllUsers } from "@/lib/api/hooks/useUser";
import { useOrganizations } from "@/lib/api/hooks/useOrganization";

export default function OwnerUsersPage() {
  const { isAuthenticated } = useAuth();
  const { currentRole } = useRole();
  const router = useRouter();

  const { data: users, isLoading: usersLoading, error: usersError } = useAllUsers();
  const { data: organizations, isLoading: orgsLoading } = useOrganizations();

  const [selectedOrg, setSelectedOrg] = useState("all");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    } else if (currentRole !== "super_admin") {
      router.push("/dashboard/users");
    }
  }, [isAuthenticated, currentRole, router]);

  type UserStatus = "active" | "pending" | "disabled";

  // Transform users data to match AllUsersTable format
  const transformedUsers = useMemo(() => {
    if (!users) return [];

    return users.flatMap((user) => {
      // If user has no memberships, show them as a single entry
      if (user.memberships.length === 0) {
        return {
          id: user.id,
          userId: user.id,
          email: user.email,
          name: user.fullName || user.email.split("@")[0],
          organizationId: "",
          role: user.role || "viewer",
          status: (user.disabled ? "disabled" : "active") as UserStatus,
          lastLogin: user.lastLogin,
          hosts: [] as string[],
        };
      }

      // Map each membership to a user entry
      return user.memberships.map((membership) => {
        const status: UserStatus = user.disabled
          ? "disabled"
          : membership.status === "verified"
          ? "active"
          : "pending";
        return {
          id: `${user.id}-${membership.id}`,
          userId: user.id,
          email: user.email,
          name: user.fullName || user.email.split("@")[0],
          organizationId: membership.organizationId,
          role: membership.role,
          status,
          lastLogin: user.lastLogin,
          hosts: membership.organization.domains || [],
        };
      });
    });
  }, [users]);

  const filteredUsers = useMemo(() => {
    if (selectedOrg === "all") {
      return transformedUsers;
    }
    return transformedUsers.filter((u) => u.organizationId === selectedOrg);
  }, [transformedUsers, selectedOrg]);

  if (!isAuthenticated || currentRole !== "super_admin") {
    return null;
  }

  if (usersLoading || orgsLoading) {
    return (
      <LayoutWrapper>
        <main className="py-8">
          <Section>
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">Loading users...</p>
            </div>
          </Section>
        </main>
      </LayoutWrapper>
    );
  }

  if (usersError) {
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
                All Users
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Manage users across all organizations
              </p>
            </div>
            {organizations && organizations.length > 0 && (
              <OrganizationSelector
                selectedOrg={selectedOrg}
                onOrgChange={setSelectedOrg}
                organizations={organizations}
              />
            )}
          </div>

          <AllUsersTable
            users={filteredUsers}
            organizations={organizations || []}
          />
        </Section>
      </main>
    </LayoutWrapper>
  );
}
