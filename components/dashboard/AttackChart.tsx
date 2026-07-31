"use client";

import { useState, useMemo } from "react";
import { ChartSkeleton } from "@/components/ui/Skeleton";
import {
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
import { useLogAnalytics } from "@/lib/api/hooks/useLogs";

interface DataPoint {
  time: string;
  attacks: number;
  blocked: number;
  allowed: number;
}

interface AttackChartProps {
  hostId?: string;
}

export function AttackChart({ hostId = "all" }: AttackChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");
  const { data: analytics, isLoading, isError } = useLogAnalytics({
    range: timeRange,
    host: hostId !== "all" ? hostId : undefined,
  });

  const data = useMemo<DataPoint[]>(
    () =>
      (analytics?.series ?? []).map((point) => {
        const timestamp = new Date(point.timestamp);
        const time =
          timeRange === "24h"
            ? timestamp.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : timestamp.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });

        return { time, ...point };
      }),
    [analytics, timeRange]
  );

  if (isLoading) {
    return <ChartSkeleton />;
  }

  if (isError && !analytics) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-8 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
        Live attack trends could not be loaded. The dashboard will retry automatically.
      </div>
    );
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
            {isError && analytics ? " · reconnecting" : ""}
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
