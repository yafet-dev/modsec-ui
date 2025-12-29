"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRole } from "@/components/providers/RoleProvider";
import { LayoutWrapper } from "@/components/ui/LayoutWrapper";
import { Section } from "@/components/ui/Section";
import { Pagination } from "@/components/ui/Pagination";
import { HostSelector } from "@/components/ui/HostSelector";
import { LogsTable } from "@/components/logs/LogsTable";
import { LogsFilters } from "@/components/logs/LogsFilters";
import { LogDetailPanel } from "@/components/logs/LogDetailPanel";
import { logsData, getLogStats, type LogEntry } from "@/data/logs";
import { hostsData } from "@/data/hosts";

const ITEMS_PER_PAGE = 10;

export default function LogsPage() {
  const { isAuthenticated } = useAuth();
  const { currentRole } = useRole();
  const router = useRouter();

  // Filter states
  const [selectedHost, setSelectedHost] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    } else if (currentRole === "super_admin") {
      router.push("/owner/logs");
    }
  }, [isAuthenticated, currentRole, router]);

  // Get host domain for filtering
  const hostDomain = useMemo(() => {
    const host = hostsData.find((h) => h.id === selectedHost);
    return host?.domain || "all";
  }, [selectedHost]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logsData.filter((log) => {
      // Host filter
      const matchesHost = hostDomain === "all" || log.host === hostDomain;

      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        log.requestUri.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.clientIp.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.ruleId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.ruleName.toLowerCase().includes(searchQuery.toLowerCase());

      // Severity filter
      const matchesSeverity =
        severityFilter === "all" || log.severity === severityFilter;

      // Action filter
      const matchesAction =
        actionFilter === "all" || log.action === actionFilter;

      return matchesHost && matchesSearch && matchesSeverity && matchesAction;
    });
  }, [hostDomain, searchQuery, severityFilter, actionFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLogs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredLogs, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedHost, searchQuery, severityFilter, actionFilter]);

  // Stats based on filtered logs
  const stats = useMemo(() => getLogStats(filteredLogs), [filteredLogs]);

  if (!isAuthenticated || currentRole === "super_admin") {
    return null;
  }

  return (
    <LayoutWrapper>
      <main className="py-8">
        <Section>
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-semibold text-gray-900 dark:text-white mb-2">
                Logs
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                View and analyze WAF event logs
              </p>
            </div>
            <HostSelector
              selectedHost={selectedHost}
              onHostChange={setSelectedHost}
            />
          </div>

          {/* Stats Grid */}
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

          {/* Filters */}
          <LogsFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            severityFilter={severityFilter}
            onSeverityChange={setSeverityFilter}
            actionFilter={actionFilter}
            onActionChange={setActionFilter}
          />

          {/* Logs Table */}
          <LogsTable logs={paginatedLogs} onSelectLog={setSelectedLog} />

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {paginatedLogs.length} of {filteredLogs.length} logs
            </p>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </Section>
      </main>

      {/* Log Detail Panel */}
      <LogDetailPanel log={selectedLog} onClose={() => setSelectedLog(null)} />
    </LayoutWrapper>
  );
}
