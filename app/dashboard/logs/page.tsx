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
import { LogProcessingStatus } from "@/components/logs/LogProcessingStatus";
import type { LogEntry } from "@/data/logs";
import {
  useLogs,
  useLogAnalytics,
  useLogHosts,
} from "@/lib/api/hooks/useLogs";
import type { GetLogsParams } from "@/lib/api/logs";

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

  const effectiveSelectedHost =
    selectedHost === "all" ||
    uniqueHosts.length === 0 ||
    uniqueHosts.some(({ host }) => host === selectedHost)
      ? selectedHost
      : "all";

  // Build API params
  const apiParams = useMemo(() => {
    const params: GetLogsParams = {
      page: currentPage,
      limit: ITEMS_PER_PAGE,
    };

    if (effectiveSelectedHost !== "all") {
      params.host = effectiveSelectedHost;
    }

    if (severityFilter !== "all") {
      params.severity =
        severityFilter.toUpperCase() as GetLogsParams["severity"];
    }

    if (actionFilter !== "all") {
      params.action = actionFilter as GetLogsParams["action"];
    }

    if (searchQuery) {
      params.search = searchQuery;
    }

    return params;
  }, [
    currentPage,
    effectiveSelectedHost,
    severityFilter,
    actionFilter,
    searchQuery,
  ]);

  // Fetch logs from API (automatically filtered by user's organizations)
  const { data: logsResponse, isLoading, error } = useLogs(apiParams);
  const {
    data: analytics,
    isLoading: analyticsLoading,
    isError: analyticsError,
  } = useLogAnalytics({
    range: "24h",
    host:
      effectiveSelectedHost !== "all" ? effectiveSelectedHost : undefined,
  });

  const logs = logsResponse?.logs || [];
  const totalLogs = logsResponse?.total || 0;
  const totalPages = Math.ceil(totalLogs / ITEMS_PER_PAGE);

  const handleHostChange = (host: string) => {
    setSelectedHost(host);
    setCurrentPage(1);
  };

  const handleSearchChange = (search: string) => {
    setSearchQuery(search);
    setCurrentPage(1);
  };

  const handleSeverityChange = (severity: string) => {
    setSeverityFilter(severity);
    setCurrentPage(1);
  };

  const handleActionChange = (action: string) => {
    setActionFilter(action);
    setCurrentPage(1);
  };

  const formatCount = (value: number | undefined) => {
    if (value === undefined) return analyticsLoading ? "Loading..." : "—";
    return value.toLocaleString();
  };

  const topRule = analytics?.summary.topRule;

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
              selectedHost={effectiveSelectedHost}
              onHostChange={handleHostChange}
              hosts={uniqueHosts}
              className="w-full sm:w-auto shrink-0"
            />
          </div>

          <LogProcessingStatus />

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Blocked (24h)
              </p>
              <p className="text-3xl font-semibold text-gray-900 dark:text-white">
                {formatCount(analytics?.summary.blockedAttacks)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Allowed (24h)
              </p>
              <p className="text-3xl font-semibold text-gray-900 dark:text-white">
                {formatCount(analytics?.summary.allowedRequests)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Top Rule
              </p>
              <p
                className="text-xl font-semibold text-gray-900 dark:text-white truncate"
                title={topRule?.ruleName}
              >
                {topRule
                  ? topRule.ruleName
                  : analyticsLoading
                    ? "Loading..."
                    : analyticsError
                      ? "Unavailable"
                      : "None"}
              </p>
              {topRule && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 truncate">
                  Rule {topRule.ruleId} · {topRule.count.toLocaleString()} events
                </p>
              )}
            </div>
          </div>

          {/* Filters */}
          <LogsFilters
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            severityFilter={severityFilter}
            onSeverityChange={handleSeverityChange}
            actionFilter={actionFilter}
            onActionChange={handleActionChange}
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
