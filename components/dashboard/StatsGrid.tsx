"use client";

import { useState, useMemo } from "react";
import { TimeFilter, type TimeRange } from "./TimeFilter";
import { useLogAnalytics } from "@/lib/api/hooks/useLogs";
import { StatsGridSkeleton } from "@/components/ui/Skeleton";

interface Stat {
  title: string;
  value: string;
  /**
   * Drives the icon colour. Every stat is currently "neutral" because no
   * period-over-period comparison is computed yet; wire that up before using
   * "up"/"down".
   */
  trend: "up" | "down" | "neutral";
  icon: React.ReactNode;
}

interface StatsGridProps {
  hostId?: string;
}

export function StatsGrid({ hostId = "all" }: StatsGridProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");
  const { data: analytics, isLoading, isError } = useLogAnalytics({
    range: timeRange,
    host: hostId !== "all" ? hostId : undefined,
  });

  // Calculate stats
  const stats = useMemo(() => {
    const totalRequests = analytics?.summary.totalRequests ?? 0;
    const blockedAttacks = analytics?.summary.blockedAttacks ?? 0;
    const threatLevel = analytics?.summary.threatLevel ?? "Low";

    const formatValue = (num: number) => {
      return Math.round(num).toLocaleString();
    };

    return [
      {
        title: "Total Requests",
        value: formatValue(totalRequests),
        trend: "neutral" as Stat["trend"],
        icon: (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
        ),
      },
      {
        title: "Blocked Attacks",
        value: formatValue(blockedAttacks),
        trend: "neutral" as Stat["trend"],
        icon: (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
        ),
      },
      {
        title: "Threat Level",
        value: threatLevel,
        trend: "neutral" as Stat["trend"],
        icon: (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        ),
      },
    ];
  }, [analytics]);

  const getThreatLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "critical":
        return "text-red-600 dark:text-red-400";
      case "high":
        return "text-orange-600 dark:text-orange-400";
      case "medium":
        return "text-yellow-600 dark:text-yellow-400";
      case "low":
        return "text-green-600 dark:text-green-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-1">
            Overview
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Key security metrics at a glance
            {isError && analytics ? " · reconnecting" : ""}
          </p>
        </div>
        <TimeFilter selected={timeRange} onChange={setTimeRange} />
      </div>

      {isError && !analytics ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-8 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
          Live overview metrics could not be loaded. The dashboard will retry automatically.
        </div>
      ) : isLoading ? (
        <StatsGridSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-center mb-4">
              <div
                className={`p-3 rounded-xl ${
                  stat.title === "Threat Level"
                    ? stat.value === "Critical" || stat.value === "High"
                      ? "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                      : stat.value === "Medium"
                      ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400"
                      : "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                    : stat.trend === "up"
                    ? "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                    : stat.trend === "down"
                    ? "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                }`}
              >
                {stat.icon}
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              {stat.title}
            </h3>
            <p
              className={`text-3xl font-semibold ${
                stat.title === "Threat Level"
                  ? getThreatLevelColor(stat.value)
                  : "text-gray-900 dark:text-white"
              }`}
            >
              {stat.value}
            </p>
          </div>
          ))}
        </div>
      )}
    </div>
  );
}
