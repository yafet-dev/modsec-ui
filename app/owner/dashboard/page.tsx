"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRole } from "@/components/providers/RoleProvider";
import { LayoutWrapper } from "@/components/ui/LayoutWrapper";
import { Section } from "@/components/ui/Section";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { AttackChart } from "@/components/dashboard/AttackChart";
import { AttackMap } from "@/components/dashboard/AttackMap";
import { useLogs } from "@/lib/api/hooks/useLogs";
import { RecentActivitySkeleton } from "@/components/ui/Skeleton";

export default function OwnerDashboard() {
  const { isAuthenticated } = useAuth();
  const { currentRole } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    } else if (currentRole !== "super_admin") {
      router.push("/dashboard");
    }
  }, [isAuthenticated, currentRole, router]);

  // Fetch recent logs for all organizations (no filters)
  const { data: logsResponse, isLoading: isLoadingLogs } = useLogs({
    page: 1,
    limit: 5,
  });

  // Transform logs to recent activity format
  const recentActivity = useMemo(() => {
    if (!logsResponse?.logs) return [];
    
    return logsResponse.logs.slice(0, 5).map((log: any) => {
      // Use createdAt instead of timestamp for time calculation
      const createdAt = log.createdAt ? new Date(log.createdAt) : new Date(log.timestamp);
      const now = new Date();
      const diffMs = now.getTime() - createdAt.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      
      let timeAgo = "";
      if (diffMins < 1) {
        timeAgo = "just now";
      } else if (diffMins < 60) {
        timeAgo = `${diffMins} ${diffMins === 1 ? "minute" : "minutes"} ago`;
      } else if (diffHours < 24) {
        timeAgo = `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
      } else {
        const diffDays = Math.floor(diffHours / 24);
        timeAgo = `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
      }

      return {
        time: timeAgo,
        event: log.ruleName || log.message || "Security event",
        ip: log.clientIp,
        severity: log.severity as "high" | "medium" | "low" | "critical",
      };
    });
  }, [logsResponse?.logs]);

  if (!isAuthenticated || currentRole !== "super_admin") {
    return null;
  }

  return (
    <LayoutWrapper>
      <main className="py-8">
        <Section>
          <div className="mb-8">
            <StatsGrid hostId="all" />
          </div>

          <div className="space-y-8 mb-8">
            <AttackMap hostId="all" simulateNewAttacks={false} />
            <AttackChart hostId="all" />
          </div>

          <div className="mt-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Recent Activity
            </h3>
            {isLoadingLogs ? (
              <RecentActivitySkeleton />
            ) : (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                  {recentActivity.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                      No recent activity found
                    </div>
                  ) : (
                    recentActivity.map((activity, index) => (
                      <div
                        key={index}
                        className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                activity.severity === "high" ||
                                activity.severity === "critical"
                                  ? "bg-red-500"
                                  : activity.severity === "medium"
                                  ? "bg-orange-500"
                                  : "bg-yellow-500"
                              }`}
                            ></div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {activity.event}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {activity.ip}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm text-gray-400 dark:text-gray-500">
                            {activity.time}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </Section>
      </main>
    </LayoutWrapper>
  );
}
