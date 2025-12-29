"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRole } from "@/components/providers/RoleProvider";
import { LayoutWrapper } from "@/components/ui/LayoutWrapper";
import { Section } from "@/components/ui/Section";
import { HostSelector } from "@/components/ui/HostSelector";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { AttackChart } from "@/components/dashboard/AttackChart";
import { AttackMap } from "@/components/dashboard/AttackMap";
import { getHostById } from "@/data/hosts";
import { getRecentActivityByHost } from "@/data/dashboard";

export default function Dashboard() {
  const { isAuthenticated } = useAuth();
  const { currentRole } = useRole();
  const router = useRouter();
  const [selectedHost, setSelectedHost] = useState("all");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    } else if (currentRole === "super_admin") {
      router.push("/owner/dashboard");
    }
  }, [isAuthenticated, currentRole, router]);

  const currentHost = getHostById(selectedHost);
  const recentActivity = useMemo(
    () => getRecentActivityByHost(selectedHost),
    [selectedHost]
  );

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
                {currentHost && currentHost.id !== "all" && (
                  <span className="ml-2 text-blue-500">
                    — {currentHost.domain}
                  </span>
                )}
              </p>
            </div>
            <HostSelector
              selectedHost={selectedHost}
              onHostChange={setSelectedHost}
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
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            activity.severity === "high"
                              ? "bg-red-500"
                              : activity.severity === "critical"
                              ? "bg-red-600"
                              : "bg-orange-500"
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
                ))}
              </div>
            </div>
          </div>
        </Section>
      </main>
    </LayoutWrapper>
  );
}
