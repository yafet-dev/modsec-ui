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
import { getLogStats, type LogEntry } from "@/data/logs";
import { useLogs, useLogHosts } from "@/lib/api/hooks/useLogs";

const ITEMS_PER_PAGE = 10;

export default function LogsPage() {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const { currentRole } = useRole();
  const router = useRouter();
  const { data: logHostsResponse } = useLogHosts();

  // Filter states
  const [selectedHost, setSelectedHost] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isAuthenticated) {
      router.push("/");
    } else if (currentRole === "super_admin") {
      router.push("/owner/logs");
    }
  }, [isAuthLoading, isAuthenticated, currentRole, router]);

  /**
   * Hosts offered in the selector, taken from the hosts that actually appear
   * in the logs rather than the organization's registered domains.
   *
   * Registered domains are apex names (gnzabe.com) while traffic arrives on
   * subdomains (apidev.gnzabe.com, apiprod.gnzabe.com). Listing only the
   * registered domains meant the host you actually wanted could never be
   * picked. Listing them alongside real hosts is no better: selecting a host
   * now matches that host exactly, so an apex with no traffic of its own would
   * return nothing and look broken.
   *
   * Every option here corresponds to real rows, and carries its count.
   */
  const uniqueHosts = useMemo(() => {
    const seen = new Map<string, number>();

    logHostsResponse?.hosts.forEach(({ host, count }) => {
      const normalized = host?.trim().toLowerCase();
      if (!normalized) return;
      seen.set(normalized, (seen.get(normalized) ?? 0) + count);
    });

    return Array.from(seen, ([host, count]) => ({ host, count })).sort((a, b) =>
      a.host.localeCompare(b.host)
    );
  }, [logHostsResponse]);

  // Build API params
  const apiParams = useMemo(() => {
    const params: any = {
      page: currentPage,
      limit: ITEMS_PER_PAGE,
    };

    if (selectedHost !== "all") {
      params.host = selectedHost;
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
  }, [currentPage, selectedHost, severityFilter, actionFilter, searchQuery]);

  // Fetch logs from API (automatically filtered by user's organizations)
  const { data: logsResponse, isLoading, error } = useLogs(apiParams);

  const logs = logsResponse?.logs || [];
  const totalLogs = logsResponse?.total || 0;
  const totalPages = Math.ceil(totalLogs / ITEMS_PER_PAGE);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedHost, searchQuery, severityFilter, actionFilter]);

  // Drop a selection that no longer exists, so the page cannot sit on a host
  // with no rows and look empty.
  useEffect(() => {
    if (
      selectedHost !== "all" &&
      uniqueHosts.length > 0 &&
      !uniqueHosts.some((h) => h.host === selectedHost)
    ) {
      setSelectedHost("all");
    }
  }, [uniqueHosts, selectedHost]);

  // Stats based on current page logs (could be enhanced to get all stats from API)
  const stats = useMemo(() => getLogStats(logs), [logs]);

  if (isAuthLoading || !isAuthenticated || currentRole === "super_admin") {
    return null;
  }

  return (
    <LayoutWrapper>
      <main className="py-8">
        <Section>
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-2">
                Logs
              </h1>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
                View and analyze WAF event logs
              </p>
            </div>
            <HostSelector
              selectedHost={selectedHost}
              onHostChange={setSelectedHost}
              hosts={uniqueHosts}
              className="w-full sm:w-auto shrink-0"
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

              {/* Pagination */}
              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left order-2 sm:order-1">
                  Showing {logs.length} of {totalLogs} logs
                </p>
                <div className="order-1 sm:order-2 flex justify-center sm:justify-end w-full sm:w-auto">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </div>
            </>
          )}
        </Section>
      </main>

      {/* Log Detail Panel */}
      <LogDetailPanel log={selectedLog} onClose={() => setSelectedLog(null)} />
    </LayoutWrapper>
  );
}
