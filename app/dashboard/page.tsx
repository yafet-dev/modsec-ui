"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRole } from "@/components/providers/RoleProvider";
import { LayoutWrapper } from "@/components/ui/LayoutWrapper";
import { Section } from "@/components/ui/Section";
import { HostSelector } from "@/components/ui/HostSelector";
import { MapSkeleton } from "@/components/ui/Skeleton";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { AttackChart } from "@/components/dashboard/AttackChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { TimeFilter, type TimeRange } from "@/components/dashboard/TimeFilter";
import { PageHeader } from "@/components/dashboard/dashboardUi";
import { useLogHosts } from "@/lib/api/hooks/useLogs";

const AttackMap = dynamic(
  () => import("@/components/dashboard/AttackMap").then((m) => ({ default: m.AttackMap })),
  { ssr: false, loading: () => <MapSkeleton /> }
);

export default function Dashboard() {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const { currentRole } = useRole();
  const router = useRouter();
  const [selectedHost, setSelectedHost] = useState("all");
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");

  // Hosts that actually appear in the logs. Selecting one matches that host
  // exactly, so only hosts with real rows are offered -- see the logs page for
  // the full explanation.
  const { data: logHostsResponse } = useLogHosts();

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

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isAuthenticated) {
      router.push("/");
    } else if (currentRole === "super_admin") {
      router.push("/owner/dashboard");
    }
  }, [isAuthLoading, isAuthenticated, currentRole, router]);

  // Fall back to all hosts when the selection no longer exists, so the page
  // cannot sit on a host with no rows and look empty.
  const activeHost =
    selectedHost !== "all" &&
    uniqueHosts.length > 0 &&
    !uniqueHosts.some((h) => h.host === selectedHost)
      ? "all"
      : selectedHost;

  if (isAuthLoading || !isAuthenticated || currentRole === "super_admin") {
    return null;
  }

  return (
    <LayoutWrapper>
      <main className="py-6 sm:py-8">
        <Section>
          <PageHeader
            live
            title="Security overview"
            description={
              <>
                Web Application Firewall activity for{" "}
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {activeHost === "all" ? "all hosts" : activeHost}
                </span>
              </>
            }
          />

          {/* Filters: one row, applies to the tiles and the trend chart */}
          <div className="mt-6 flex flex-col gap-3 border-y border-gray-200/80 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.08]">
            <HostSelector
              selectedHost={activeHost}
              onHostChange={setSelectedHost}
              hosts={uniqueHosts}
              className="w-full sm:w-auto"
            />
            <TimeFilter selected={timeRange} onChange={setTimeRange} />
          </div>

          <div className="mt-6 space-y-4">
            <StatsGrid hostId={activeHost} range={timeRange} />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="min-w-0 lg:col-span-2">
                <AttackChart hostId={activeHost} range={timeRange} />
              </div>
              <div className="min-w-0">
                <RecentActivity hostId={activeHost} logsHref="/dashboard/logs" />
              </div>
            </div>

            <AttackMap hostId={activeHost} simulateNewAttacks={false} />
          </div>
        </Section>
      </main>
    </LayoutWrapper>
  );
}
