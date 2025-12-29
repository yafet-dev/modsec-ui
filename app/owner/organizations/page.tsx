"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRole } from "@/components/providers/RoleProvider";
import { LayoutWrapper } from "@/components/ui/LayoutWrapper";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { OrganizationsTable } from "@/components/owner/OrganizationsTable";
import { AddOrganizationModal } from "@/components/owner/AddOrganizationModal";
import { ManageOrganizationModal } from "@/components/owner/ManageOrganizationModal";
import { type Organization } from "@/data/organizations";
import {
  useOrganizations,
  useCreateOrganization,
  useUpdateOrganization,
  useDeleteOrganization,
} from "@/lib/api/hooks/useOrganization";

export default function OrganizationsPage() {
  const { isAuthenticated, user } = useAuth();
  const { currentRole } = useRole();
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  const { data: organizations = [], isLoading, error } = useOrganizations();
  const createOrganization = useCreateOrganization();
  const updateOrganization = useUpdateOrganization();
  const deleteOrganization = useDeleteOrganization();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    } else if (currentRole !== "super_admin") {
      router.push("/dashboard");
    }
  }, [isAuthenticated, currentRole, router]);

  const handleAddOrganization = (newOrg: {
    name: string;
    domains: string[];
    adminEmail: string;
  }) => {
    createOrganization.mutate(newOrg, {
      onSuccess: () => {
        setIsAddModalOpen(false);
      },
    });
  };

  const handleManage = (org: Organization) => {
    setSelectedOrg(org);
    setIsManageModalOpen(true);
  };

  const handleUpdate = (updatedOrg: Organization) => {
    if (!updatedOrg.id) return;

    updateOrganization.mutate(
      {
        id: updatedOrg.id,
        data: {
          name: updatedOrg.name,
          domains: updatedOrg.domains,
          status: updatedOrg.status,
        },
      },
      {
        onSuccess: () => {
          setIsManageModalOpen(false);
          setSelectedOrg(null);
        },
      }
    );
  };

  const handleDelete = (orgId: string) => {
    if (confirm("Are you sure you want to delete this organization?")) {
      deleteOrganization.mutate(orgId, {
        onSuccess: () => {
          setIsManageModalOpen(false);
          setSelectedOrg(null);
        },
      });
    }
  };

  const handleToggleStatus = (orgId: string) => {
    const org = organizations.find((o) => o.id === orgId);
    if (!org) return;

    updateOrganization.mutate({
      id: orgId,
      data: {
        status: org.status === "disabled" ? "active" : "disabled",
      },
    });
  };

  if (!isAuthenticated || currentRole !== "super_admin") {
    return null;
  }

  return (
    <LayoutWrapper>
      <main className="py-8">
        <Section>
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-semibold text-gray-900 dark:text-white mb-2">
                Organizations
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Manage organizations and their access
              </p>
            </div>
            <Button onClick={() => setIsAddModalOpen(true)}>
              Add Organization
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                Loading organizations...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 dark:text-red-400">
                Failed to load organizations
              </p>
            </div>
          ) : organizations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                No organizations found
              </p>
            </div>
          ) : (
            <OrganizationsTable
              organizations={organizations}
              onManage={handleManage}
            />
          )}

          <AddOrganizationModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onAdd={handleAddOrganization}
            isLoading={createOrganization.isPending}
          />

          <ManageOrganizationModal
            isOpen={isManageModalOpen}
            organization={selectedOrg}
            onClose={() => {
              setIsManageModalOpen(false);
              setSelectedOrg(null);
            }}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
          />
        </Section>
      </main>
    </LayoutWrapper>
  );
}
