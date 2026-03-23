"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRole } from "@/components/providers/RoleProvider";
import { LayoutWrapper } from "@/components/ui/LayoutWrapper";
import { Section } from "@/components/ui/Section";
import { Pagination } from "@/components/ui/Pagination";
import { OrganizationSelector } from "@/components/owner/OrganizationSelector";
import { RulesTable } from "@/components/rules/RulesTable";
import { RulesFilters } from "@/components/rules/RulesFilters";
import { AddCustomRuleModal } from "@/components/rules/AddCustomRuleModal";
import { rulesData, type Rule } from "@/data/rules";
import { useOrganizations } from "@/lib/api/hooks/useOrganization";
import { rulesApi } from "@/lib/api/rules";
import toast from "react-hot-toast";

const ITEMS_PER_PAGE = 10;

export default function OwnerRulesPage() {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const { currentRole } = useRole();
  const router = useRouter();
  const { data: organizations } = useOrganizations();

  const [selectedOrg, setSelectedOrg] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [rules, setRules] = useState<Rule[]>(rulesData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load custom rules from localStorage on mount
  useEffect(() => {
    const loadCustomRules = async () => {
      try {
        const customRules = await rulesApi.getAll();
        // Merge custom rules with existing rules, avoiding duplicates
        const existingIds = new Set(rulesData.map((r) => r.id));
        const newCustomRules = customRules.filter(
          (r) => !existingIds.has(r.id)
        );
        setRules([...rulesData, ...newCustomRules]);
      } catch (error) {
        console.error("Failed to load custom rules:", error);
      }
    };
    loadCustomRules();
  }, []);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isAuthenticated) {
      router.push("/");
    } else if (currentRole !== "super_admin") {
      router.push("/dashboard/rules");
    }
  }, [isAuthLoading, isAuthenticated, currentRole, router]);

  const filteredRules = useMemo(() => {
    return rules.filter((rule) => {
      const matchesSearch =
        searchQuery === "" ||
        rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rule.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rule.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSeverity =
        severityFilter === "all" || rule.severity === severityFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "enabled" && rule.enabled) ||
        (statusFilter === "disabled" && !rule.enabled);

      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [rules, searchQuery, severityFilter, statusFilter]);

  const totalPages = Math.ceil(filteredRules.length / ITEMS_PER_PAGE);
  const paginatedRules = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRules.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredRules, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedOrg, searchQuery, severityFilter, statusFilter]);

  const handleToggleRule = (ruleId: string) => {
    setRules((prev) =>
      prev.map((rule) =>
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      )
    );
  };

  // Handle adding new custom rule
  const handleAddRule = async (data: {
    name: string;
    description: string;
    severity: Rule["severity"];
    category: string;
    ruleContent: string;
  }) => {
    setIsSubmitting(true);
    try {
      const response = await rulesApi.create(data);
      setRules((prev) => [...prev, response.rule]);
      setIsModalOpen(false);
      toast.success(
        "Custom rule submitted successfully! It will be reviewed by a super_admin."
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to create rule. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle approving/rejecting rules (super_admin only)
  const handleApproveRule = async (ruleId: string, approved: boolean) => {
    try {
      const response = await rulesApi.approve(ruleId, approved);
      setRules((prev) =>
        prev.map((rule) => (rule.id === ruleId ? response.rule : rule))
      );
      toast.success(
        approved
          ? "Rule approved and enabled successfully!"
          : "Rule rejected successfully!"
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to update rule approval status.");
    }
  };

  if (isAuthLoading || !isAuthenticated || currentRole !== "super_admin") {
    return null;
  }

  return (
    <LayoutWrapper>
      <main className="py-8">
        <Section>
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-semibold text-gray-900 dark:text-white mb-2">
                All Rules
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Manage WAF rules across all organizations
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

          <RulesFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            severityFilter={severityFilter}
            onSeverityChange={setSeverityFilter}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            onAddRule={() => setIsModalOpen(true)}
          />

          {/* Add Custom Rule Modal */}
          <AddCustomRuleModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleAddRule}
            isLoading={isSubmitting}
          />

          <RulesTable
            rules={paginatedRules}
            onToggleRule={handleToggleRule}
            onApproveRule={handleApproveRule}
          />

          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {paginatedRules.length} of {filteredRules.length} rules
            </p>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </Section>
      </main>
    </LayoutWrapper>
  );
}
