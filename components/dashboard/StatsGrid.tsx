"use client";

import { useState, useMemo } from "react";
import { TimeFilter, type TimeRange } from "./TimeFilter";
import { useLogs } from "@/lib/api/hooks/useLogs";
import type { LogEntry } from "@/data/logs";
import { StatsGridSkeleton } from "@/components/ui/Skeleton";

interface Stat {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: React.ReactNode;
}

interface StatsGridProps {
  hostId?: string;
}

// Calculate start date based on time range
function getStartDate(range: TimeRange): Date {
  const now = new Date();
  const start = new Date(now);

  switch (range) {
    case "24h":
      start.setHours(now.getHours() - 24);
      break;
    case "7d":
      start.setDate(now.getDate() - 7);
      break;
    case "30d":
      start.setDate(now.getDate() - 30);
      break;
    case "3m":
      start.setMonth(now.getMonth() - 3);
      break;
  }

  return start;
}

// Filter logs by time range and host
function filterLogsByRange(logs: LogEntry[], range: TimeRange, hostId: string): LogEntry[] {
  const startDate = getStartDate(range);
  
  return logs.filter((log) => {
    const logDate = new Date(log.timestamp);
    
    // Filter by time
    if (logDate < startDate) {
      return false;
    }
    
    // Filter by host
    if (hostId !== "all" && log.host !== hostId) {
      return false;
    }
    
    return true;
  });
}

// Calculate threat level from logs
function calculateThreatLevel(logs: LogEntry[]): string {
  if (logs.length === 0) return "Low";

  const severityCounts = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };

  logs.forEach((log) => {
    const severity = log.severity.toLowerCase();
    if (severityCounts.hasOwnProperty(severity)) {
      severityCounts[severity as keyof typeof severityCounts]++;
    }
  });

  const total = logs.length;
  const criticalPercent = (severityCounts.critical / total) * 100;
  const highPercent = (severityCounts.high / total) * 100;
  const mediumPercent = (severityCounts.medium / total) * 100;

  if (criticalPercent > 10 || (criticalPercent > 5 && highPercent > 20)) {
    return "Critical";
  }
  if (highPercent > 15 || (highPercent > 10 && mediumPercent > 30)) {
    return "High";
  }
  if (mediumPercent > 25 || (highPercent > 5 && mediumPercent > 15)) {
    return "Medium";
  }
  return "Low";
}

export function StatsGrid({ hostId = "all" }: StatsGridProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");
  
  // Fetch logs - get a large limit to calculate stats
  // In production, you'd want a stats endpoint, but this works for now
  const { data: logsResponse, isLoading } = useLogs({
    page: 1,
    limit: 1000, // Get enough logs to calculate stats
    host: hostId !== "all" ? hostId : undefined,
  });

  const logs = logsResponse?.logs || [];

  // Filter logs by time range
  const filteredLogs = useMemo(() => {
    return filterLogsByRange(logs, timeRange, hostId);
  }, [logs, timeRange, hostId]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalRequests = filteredLogs.length;
    const blockedAttacks = filteredLogs.filter((log) => log.action === "blocked").length;
    const threatLevel = calculateThreatLevel(filteredLogs);

    const formatValue = (num: number) => {
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
      return Math.round(num).toLocaleString();
    };

    // For now, percentage change is set to "Stable" - can be enhanced later
    // to compare with previous period
    return [
      {
        title: "Total Requests",
        value: formatValue(totalRequests),
        change: "Stable",
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
        change: "Stable",
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
        change: "Stable",
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
      {
        title: "Active Rules",
        value: "45", // Keep fake for now as requested
        change: "Stable",
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
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        ),
      },
    ];
  }, [filteredLogs]);

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
            Overview
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Key security metrics at a glance
          </p>
        </div>
        <TimeFilter selected={timeRange} onChange={setTimeRange} />
      </div>

      {isLoading ? (
        <StatsGridSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-4">
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
              <span
                className={`text-sm font-medium ${
                  stat.trend === "up"
                    ? "text-red-600 dark:text-red-400"
                    : stat.trend === "down"
                    ? "text-green-600 dark:text-green-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {stat.change}
              </span>
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
