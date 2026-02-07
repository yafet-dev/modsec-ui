"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRole } from "@/components/providers/RoleProvider";
import { LayoutWrapper } from "@/components/ui/LayoutWrapper";
import { Section } from "@/components/ui/Section";
import { Pagination } from "@/components/ui/Pagination";
import { OrganizationSelector } from "@/components/owner/OrganizationSelector";
import { LogsTable } from "@/components/logs/LogsTable";
import { LogsFilters } from "@/components/logs/LogsFilters";
import { LogDetailPanel } from "@/components/logs/LogDetailPanel";
import { getLogStats, type LogEntry } from "@/data/logs";
import { useOrganizations } from "@/lib/api/hooks/useOrganization";
import { useLogs } from "@/lib/api/hooks/useLogs";

const ITEMS_PER_PAGE = 10;

export default function OwnerLogsPage() {
  const { isAuthenticated } = useAuth();
  const { currentRole } = useRole();
  const router = useRouter();
  const { data: organizations } = useOrganizations();

  const [selectedOrg, setSelectedOrg] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    } else if (currentRole !== "super_admin") {
      router.push("/dashboard/logs");
    }
  }, [isAuthenticated, currentRole, router]);

  // Build API params
  const apiParams = useMemo(() => {
    const params: any = {
      page: currentPage,
      limit: ITEMS_PER_PAGE,
    };

    if (selectedOrg !== "all") {
      params.organizationId = selectedOrg;
    }

    if (severityFilter !== "all") {
      params.severity = severityFilter.toUpperCase();
    }

    if (actionFilter !== "all") {
      params.action = actionFilter;
    }

    if (searchQuery) {
      params.search = searchQuery;
    }

    return params;
  }, [currentPage, selectedOrg, severityFilter, actionFilter, searchQuery]);

  // Fetch logs from API
  const { data: logsResponse, isLoading, error } = useLogs(apiParams);

  const logs = logsResponse?.logs || [];
  const totalLogs = logsResponse?.total || 0;
  const totalPages = Math.ceil(totalLogs / ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedOrg, searchQuery, severityFilter, actionFilter]);

  const stats = useMemo(() => getLogStats(logs), [logs]);

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
                All Logs
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                View and analyze WAF event logs across all organizations
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Blocked Today
              </p>
              <p className="text-3xl font-semibold text-gray-900 dark:text-white">
                {stats.blockedToday}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Allowed Today
              </p>
              <p className="text-3xl font-semibold text-gray-900 dark:text-white">
                {stats.warningToday}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Top Rule
              </p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white truncate">
                {stats.topRule}
              </p>
            </div>
          </div>

          <LogsFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            severityFilter={severityFilter}
            onSeverityChange={setSeverityFilter}
            actionFilter={actionFilter}
            onActionChange={setActionFilter}
          />

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">Loading logs...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">Error loading logs. Please try again.</p>
            </div>
          ) : (
            <>
              <LogsTable logs={logs} onSelectLog={setSelectedLog} />

              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {logs.length} of {totalLogs} logs
                </p>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          )}
        </Section>
      </main>

      <LogDetailPanel log={selectedLog} onClose={() => setSelectedLog(null)} />
    </LayoutWrapper>
  );
}
