"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRole } from "@/components/providers/RoleProvider";
import { LayoutWrapper } from "@/components/ui/LayoutWrapper";
import { Section } from "@/components/ui/Section";
import { HostSelector } from "@/components/ui/HostSelector";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { AttackChart } from "@/components/dashboard/AttackChart";
import { useMyOrganizations } from "@/lib/api/hooks/useOrganization";
import { useLogs } from "@/lib/api/hooks/useLogs";
import type { LogSeverity } from "@/data/logs";

function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const diffSec = Math.round((Date.now() - then) / 1000);
  if (diffSec < 45) return "Just now";
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleString();
}

function severityDotClass(sev: LogSeverity | "critical" | "high" | "medium" | "low"): string {
  switch (sev) {
    case "critical":
      return "bg-red-600";
    case "high":
      return "bg-red-500";
    case "medium":
      return "bg-orange-500";
    case "low":
      return "bg-yellow-500";
    default:
      return "bg-gray-400";
  }
}

const AttackMap = dynamic(
  () => import("@/components/dashboard/AttackMap").then((m) => ({ default: m.AttackMap })),
  { ssr: false, loading: () => <div className="w-full min-h-96 rounded-xl bg-gray-100 dark:bg-gray-800/50 animate-pulse" /> }
);

export default function Dashboard() {
  const { isAuthenticated } = useAuth();
  const { currentRole } = useRole();
  const router = useRouter();
  const [selectedHost, setSelectedHost] = useState("all");
  const { data: myOrganizations } = useMyOrganizations();

  const uniqueHosts = useMemo(() => {
    const hostsSet = new Set<string>();
    if (myOrganizations) {
      myOrganizations.forEach((org) => {
        org.domains.forEach((domain) => {
          hostsSet.add(domain);
        });
      });
    }
    return Array.from(hostsSet).sort();
  }, [myOrganizations]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    } else if (currentRole === "super_admin") {
      router.push("/owner/dashboard");
    }
  }, [isAuthenticated, currentRole, router]);

  useEffect(() => {
    if (
      selectedHost !== "all" &&
      uniqueHosts.length > 0 &&
      !uniqueHosts.includes(selectedHost)
    ) {
      setSelectedHost("all");
    }
  }, [uniqueHosts, selectedHost]);

  const { data: activityLogsResponse, isLoading: activityLoading } = useLogs({
    page: 1,
    limit: 8,
    host: selectedHost !== "all" ? selectedHost : undefined,
  });

  const recentActivity = useMemo(() => {
    const logs = activityLogsResponse?.logs ?? [];
    return logs.map((log) => ({
      id: log.id,
      event: log.ruleName || `${log.action} ${log.method} ${log.requestUri}`,
      ip: log.clientIp,
      time: formatRelativeTime(log.timestamp),
      severity: log.severity as LogSeverity,
    }));
  }, [activityLogsResponse]);

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
                Dashboard
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Real-time security monitoring and analytics
                {selectedHost !== "all" && (
                  <span className="ml-2 text-blue-500">— {selectedHost}</span>
                )}
              </p>
            </div>
            <HostSelector
              selectedHost={selectedHost}
              onHostChange={setSelectedHost}
              hosts={uniqueHosts}
            />
          </div>

          <div className="mb-8">
            <StatsGrid hostId={selectedHost} />
          </div>

          <div className="space-y-8 mb-8">
            <AttackMap hostId={selectedHost} simulateNewAttacks={false} />
            <AttackChart hostId={selectedHost} />
          </div>

          <div className="mt-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Recent Activity
            </h3>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {activityLoading ? (
                  <div className="p-6 text-sm text-gray-500 dark:text-gray-400">
                    Loading recent activity…
                  </div>
                ) : recentActivity.length === 0 ? (
                  <div className="p-6 text-sm text-gray-500 dark:text-gray-400">
                    No recent WAF events for this selection.
                  </div>
                ) : (
                  recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <div
                            className={`w-2 h-2 shrink-0 rounded-full ${severityDotClass(
                              activity.severity
                            )}`}
                          />
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white truncate">
                              {activity.event}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {activity.ip}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-400 dark:text-gray-500 shrink-0">
                          {activity.time}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Section>
      </main>
    </LayoutWrapper>
  );
}
