"use client";

import { useEffect, useMemo, useState } from "react";
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
import { MiniStat, PageHeader, useChartColors } from "@/components/dashboard/dashboardUi";
import type { LogEntry } from "@/data/logs";
import { useLogs, useLogAnalytics, useLogHosts } from "@/lib/api/hooks/useLogs";
import type { GetLogsParams } from "@/lib/api/logs";

const ITEMS_PER_PAGE = 10;

export default function LogsPage() {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const { currentRole } = useRole();
  const router = useRouter();
  const colors = useChartColors();
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

  const apiParams = useMemo(() => {
    const params: GetLogsParams = {
      page: currentPage,
      limit: ITEMS_PER_PAGE,
    };

    if (effectiveSelectedHost !== "all") {
      params.host = effectiveSelectedHost;
    }
    if (severityFilter !== "all") {
      params.severity = severityFilter.toUpperCase() as GetLogsParams["severity"];
    }
    if (actionFilter !== "all") {
      params.action = actionFilter as GetLogsParams["action"];
    }
    if (searchQuery) {
      params.search = searchQuery;
    }

    return params;
  }, [currentPage, effectiveSelectedHost, severityFilter, actionFilter, searchQuery]);

  // Fetch logs from API (automatically filtered by user's organizations)
  const { data: logsResponse, isLoading, error } = useLogs(apiParams);
  const {
    data: analytics,
    isLoading: analyticsLoading,
    isError: analyticsError,
  } = useLogAnalytics({
    range: "24h",
    host: effectiveSelectedHost !== "all" ? effectiveSelectedHost : undefined,
  });

  const logs = logsResponse?.logs || [];
  const totalLogs = logsResponse?.total || 0;
  const totalPages = Math.ceil(totalLogs / ITEMS_PER_PAGE);
  const firstShown = totalLogs === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const lastShown = (currentPage - 1) * ITEMS_PER_PAGE + logs.length;
  const hasFilters =
    searchQuery !== "" || severityFilter !== "all" || actionFilter !== "all";

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
  const clearFilters = () => {
    setSearchQuery("");
    setSeverityFilter("all");
    setActionFilter("all");
    setCurrentPage(1);
  };

  const formatCount = (value: number | undefined) => {
    if (value === undefined) return analyticsLoading ? "…" : "—";
    return value.toLocaleString();
  };

  const summary = analytics?.summary;
  const blockRate =
    summary && summary.totalRequests > 0
      ? (summary.blockedAttacks / summary.totalRequests) * 100
      : null;
  const topRule = summary?.topRule;

  if (isAuthLoading || !isAuthenticated || currentRole === "super_admin") {
    return null;
  }

  return (
    <LayoutWrapper>
      <main className="py-6 sm:py-8">
        <Section>
          <PageHeader
            live
            title="Event logs"
            description={
              <>
                Every WAF event for{" "}
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {effectiveSelectedHost === "all" ? "all hosts" : effectiveSelectedHost}
                </span>
                . Select a row to inspect it.
              </>
            }
          />

          {/* Filters */}
          <div className="mt-6 border-y border-gray-200/80 py-3 dark:border-white/[0.08]">
            <LogsFilters
              className=""
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              severityFilter={severityFilter}
              onSeverityChange={handleSeverityChange}
              actionFilter={actionFilter}
              onActionChange={handleActionChange}
            >
              <HostSelector
                selectedHost={effectiveSelectedHost}
                onHostChange={handleHostChange}
                hosts={uniqueHosts}
                className="w-full sm:w-auto"
              />
              {hasFilters ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="h-9 cursor-pointer rounded-lg px-3 text-[13px] font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/[0.06] dark:hover:text-white"
                >
                  Clear filters
                </button>
              ) : null}
            </LogsFilters>
          </div>

          <div className="mt-6">
            <LogProcessingStatus />

            {/* Last 24 hours at a glance */}
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
              <MiniStat
                label="Events, last 24h"
                value={formatCount(summary?.totalRequests)}
                sub={analyticsError && !summary ? "Unavailable" : "Detected by the WAF"}
              />
              <MiniStat
                label="Blocked"
                accent={colors.blocked}
                value={formatCount(summary?.blockedAttacks)}
                sub={blockRate === null ? "No events yet" : `${blockRate.toFixed(1)}% of events`}
              />
              <MiniStat
                label="Allowed"
                accent={colors.allowed}
                value={formatCount(summary?.allowedRequests)}
                sub="Logged, not blocked"
              />
              <MiniStat
                label="Top rule"
                value={
                  <span title={topRule?.ruleName}>
                    {topRule
                      ? topRule.ruleName || topRule.ruleId
                      : analyticsLoading
                        ? "…"
                        : analyticsError
                          ? "Unavailable"
                          : "None"}
                  </span>
                }
                sub={
                  topRule
                    ? `Rule ${topRule.ruleId} · ${topRule.count.toLocaleString()} events`
                    : undefined
                }
              />
            </div>

            <div className="mt-4">
              <LogsTable
                logs={logs}
                onSelectLog={setSelectedLog}
                isLoading={isLoading}
                errorMessage={error ? "Please try again in a moment." : undefined}
                title="Events"
                subtitle={
                  isLoading
                    ? "Loading…"
                    : `${totalLogs.toLocaleString()} ${totalLogs === 1 ? "event" : "events"}${
                        hasFilters ? " match your filters" : ""
                      } · newest first`
                }
                footer={
                  !isLoading && !error && totalLogs > 0 ? (
                    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
                      <p className="text-[13px] tabular-nums text-gray-500 dark:text-gray-400">
                        Showing {firstShown.toLocaleString()}–{lastShown.toLocaleString()} of{" "}
                        {totalLogs.toLocaleString()}
                      </p>
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                      />
                    </div>
                  ) : undefined
                }
              />
            </div>
          </div>
        </Section>
      </main>

      <LogDetailPanel log={selectedLog} onClose={() => setSelectedLog(null)} />
    </LayoutWrapper>
  );
}
