"use client";

import { useState, useMemo } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { ChartSkeleton } from "@/components/ui/Skeleton";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TimeFilter, type TimeRange } from "./TimeFilter";
import { useLogs } from "@/lib/api/hooks/useLogs";
import { LogEntry } from "@/data/logs";

interface DataPoint {
  time: string;
  attacks: number;
  blocked: number;
  allowed: number;
}

interface AttackChartProps {
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

// Group logs by time intervals based on range
function groupLogsByTimeRange(
  logs: LogEntry[],
  range: TimeRange,
  hostId: string
): DataPoint[] {
  const startDate = getStartDate(range);
  
  // Filter logs by time range and host
  const filteredLogs = logs.filter((log) => {
    const logDate = new Date(log.timestamp);
    if (logDate < startDate) return false;
    if (hostId !== "all" && log.host !== hostId) return false;
    return true;
  });

  const now = new Date();
  let points = 24;
  let intervalMs = 60 * 60 * 1000; // 1 hour in milliseconds

  switch (range) {
    case "24h":
      points = 24;
      intervalMs = 60 * 60 * 1000; // 1 hour
      break;
    case "7d":
      points = 7;
      intervalMs = 24 * 60 * 60 * 1000; // 1 day
      break;
    case "30d":
      points = 30;
      intervalMs = 24 * 60 * 60 * 1000; // 1 day
      break;
    case "3m":
      points = 12;
      intervalMs = 7 * 24 * 60 * 60 * 1000; // 1 week
      break;
  }

  // Create time buckets
  const buckets: Map<number, { attacks: number; blocked: number; allowed: number }> = new Map();
  
  // Initialize all buckets with zeros
  for (let i = points - 1; i >= 0; i--) {
    const bucketTime = new Date(now.getTime() - i * intervalMs);
    // Round down to the start of the interval
    const bucketKey = range === "24h"
      ? new Date(bucketTime.getFullYear(), bucketTime.getMonth(), bucketTime.getDate(), bucketTime.getHours()).getTime()
      : range === "7d" || range === "30d"
      ? new Date(bucketTime.getFullYear(), bucketTime.getMonth(), bucketTime.getDate()).getTime()
      : new Date(bucketTime.getFullYear(), bucketTime.getMonth(), bucketTime.getDate() - bucketTime.getDay()).getTime(); // Start of week
    
    buckets.set(bucketKey, { attacks: 0, blocked: 0, allowed: 0 });
  }

  // Group logs into buckets
  filteredLogs.forEach((log) => {
    const logDate = new Date(log.timestamp);
    let bucketKey: number;
    
    if (range === "24h") {
      bucketKey = new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate(), logDate.getHours()).getTime();
    } else if (range === "7d" || range === "30d") {
      bucketKey = new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate()).getTime();
    } else {
      // 3m - group by week
      bucketKey = new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate() - logDate.getDay()).getTime();
    }

    const bucket = buckets.get(bucketKey);
    if (bucket) {
      bucket.attacks++;
      if (log.action === "blocked") {
        bucket.blocked++;
      } else {
        bucket.allowed++;
      }
    }
  });

  // Convert buckets to data points with proper labels
  const data: DataPoint[] = [];
  for (let i = points - 1; i >= 0; i--) {
    const bucketTime = new Date(now.getTime() - i * intervalMs);
    let bucketKey: number;
    
    if (range === "24h") {
      bucketKey = new Date(bucketTime.getFullYear(), bucketTime.getMonth(), bucketTime.getDate(), bucketTime.getHours()).getTime();
    } else if (range === "7d" || range === "30d") {
      bucketKey = new Date(bucketTime.getFullYear(), bucketTime.getMonth(), bucketTime.getDate()).getTime();
    } else {
      bucketKey = new Date(bucketTime.getFullYear(), bucketTime.getMonth(), bucketTime.getDate() - bucketTime.getDay()).getTime();
    }

    const bucket = buckets.get(bucketKey) || { attacks: 0, blocked: 0, allowed: 0 };
    
    const timeLabel =
      range === "24h"
        ? bucketTime.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : range === "7d" || range === "30d"
        ? bucketTime.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : bucketTime.toLocaleDateString("en-US", { month: "short" });

    data.push({
      time: timeLabel,
      attacks: bucket.attacks,
      blocked: bucket.blocked,
      allowed: bucket.allowed,
    });
  }

  return data;
}

export function AttackChart({ hostId = "all" }: AttackChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");
  const { theme } = useTheme();
  
  // Determine limit based on time range
  const limit = useMemo(() => {
    switch (timeRange) {
      case "24h":
        return 5000; // Get more logs for 24h
      case "7d":
        return 10000;
      case "30d":
        return 50000;
      case "3m":
        return 100000;
      default:
        return 10000;
    }
  }, [timeRange]);

  // Fetch logs from API
  const { data: logsResponse, isLoading } = useLogs({
    page: 1,
    limit,
    host: hostId !== "all" ? hostId : undefined,
  });

  const logs = logsResponse?.logs || [];

  // Group logs by time range
  const data = useMemo(() => {
    return groupLogsByTimeRange(logs, timeRange, hostId);
  }, [logs, timeRange, hostId]);

  if (isLoading) {
    return <ChartSkeleton />;
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 sm:p-6 overflow-x-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-4 sm:mb-6">
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Attack Trends
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Security events over time
          </p>
        </div>
        <TimeFilter selected={timeRange} onChange={setTimeRange} />
      </div>

      <div className="w-full min-h-[240px] sm:min-h-[300px]">
        <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorAttacks" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-gray-200 dark:stroke-gray-800"
          />
          <XAxis
            dataKey="time"
            className="text-xs text-gray-500 dark:text-gray-400"
            stroke="currentColor"
          />
          <YAxis
            className="text-xs text-gray-500 dark:text-gray-400"
            stroke="currentColor"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--tooltip-bg, rgb(255, 255, 255))",
              border: "var(--tooltip-border, 1px solid rgb(229, 231, 235))",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "var(--tooltip-text, rgb(17, 24, 39))" }}
          />
          <Area
            type="monotone"
            dataKey="attacks"
            stroke="#ef4444"
            fillOpacity={1}
            fill="url(#colorAttacks)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="blocked"
            stroke="#f97316"
            fillOpacity={1}
            fill="url(#colorBlocked)"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="allowed"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 sm:gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-gray-600 dark:text-gray-400">
            Total Attacks
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Blocked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Allowed</span>
        </div>
      </div>
    </div>
  );
}
