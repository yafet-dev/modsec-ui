"use client";

import { useState, useEffect, useMemo } from "react";
import { TimeFilter, type TimeRange } from "./TimeFilter";
import { getStatsByHost } from "@/data/dashboard";

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

function generateStats(range: TimeRange, hostId: string): Stat[] {
  const hostStats = getStatsByHost(hostId);

  // Realistic whole numbers for each time range (educated guesses for small site)
  // Based on ~10k requests over 30 months = ~11 requests/day average
  const timeRangeStats: Record<string, { requests: number; blocked: number }> = {
    all: {
      "24h": { requests: 11, blocked: 0 },
      "7d": { requests: 78, blocked: 2 },
      "30d": { requests: 333, blocked: 8 },
      "3m": { requests: 10000, blocked: 247 },
    },
    api: {
      "24h": { requests: 4, blocked: 0 },
      "7d": { requests: 25, blocked: 1 },
      "30d": { requests: 107, blocked: 4 },
      "3m": { requests: 3200, blocked: 128 },
    },
    www: {
      "24h": { requests: 5, blocked: 0 },
      "7d": { requests: 35, blocked: 1 },
      "30d": { requests: 150, blocked: 2 },
      "3m": { requests: 4500, blocked: 67 },
    },
    admin: {
      "24h": { requests: 1, blocked: 0 },
      "7d": { requests: 9, blocked: 1 },
      "30d": { requests: 40, blocked: 1 },
      "3m": { requests: 1200, blocked: 38 },
    },
    files: {
      "24h": { requests: 1, blocked: 0 },
      "7d": { requests: 6, blocked: 0 },
      "30d": { requests: 27, blocked: 0 },
      "3m": { requests: 800, blocked: 12 },
    },
    cdn: {
      "24h": { requests: 0, blocked: 0 },
      "7d": { requests: 2, blocked: 0 },
      "30d": { requests: 10, blocked: 0 },
      "3m": { requests: 300, blocked: 2 },
    },
  };

  const stats = timeRangeStats[hostId] || timeRangeStats.all;
  const rangeData = stats[range];

  const formatValue = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return Math.round(num).toLocaleString();
  };

  return [
    {
      title: "Total Requests",
      value: formatValue(rangeData.requests),
      change:
        hostStats.requestsChange >= 0
          ? `+${hostStats.requestsChange}%`
          : `${hostStats.requestsChange}%`,
      trend: hostStats.requestsChange >= 0 ? "up" : "down",
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
      value: formatValue(rangeData.blocked),
      change:
        hostStats.attacksChange >= 0
          ? `+${hostStats.attacksChange}%`
          : `${hostStats.attacksChange}%`,
      trend: hostStats.attacksChange > 0 ? "up" : "down",
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
      value: hostStats.threatLevel,
      change:
        hostStats.threatChange === 0
          ? "Stable"
          : hostStats.threatChange > 0
          ? `+${hostStats.threatChange}%`
          : `${hostStats.threatChange}%`,
      trend:
        hostStats.threatChange > 0
          ? "up"
          : hostStats.threatChange < 0
          ? "down"
          : "neutral",
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
      value: hostStats.activeRules,
      change:
        hostStats.rulesChange > 0
          ? `+${hostStats.rulesChange}`
          : `${hostStats.rulesChange}`,
      trend: hostStats.rulesChange > 0 ? "up" : "neutral",
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
}

export function StatsGrid({ hostId = "all" }: StatsGridProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");
  const stats = useMemo(
    () => generateStats(timeRange, hostId),
    [timeRange, hostId]
  );

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
    </div>
  );
}
