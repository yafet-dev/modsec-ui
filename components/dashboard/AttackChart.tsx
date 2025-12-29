"use client";

import { useState, useMemo } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";
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

interface DataPoint {
  time: string;
  attacks: number;
  blocked: number;
  allowed: number;
}

interface AttackChartProps {
  hostId?: string;
}

// Different base multipliers for each host to create unique patterns
// Scaled down for small site: ~10k requests over 30 months = ~11 requests/day
const hostPatterns: Record<
  string,
  { attackBase: number; blockRate: number; variance: number }
> = {
  all: { attackBase: 1.2, blockRate: 0.25, variance: 0.8 }, // ~1-2 requests/hour
  api: { attackBase: 0.4, blockRate: 0.4, variance: 0.3 }, // ~0.3-0.7 requests/hour
  www: { attackBase: 0.6, blockRate: 0.15, variance: 0.4 }, // ~0.4-1 requests/hour
  admin: { attackBase: 0.15, blockRate: 0.3, variance: 0.1 }, // ~0.1-0.25 requests/hour
  files: { attackBase: 0.1, blockRate: 0.15, variance: 0.08 }, // ~0.05-0.18 requests/hour
  cdn: { attackBase: 0.04, blockRate: 0.1, variance: 0.03 }, // ~0.02-0.07 requests/hour
};

function generateData(range: TimeRange, hostId: string): DataPoint[] {
  const now = new Date();
  const data: DataPoint[] = [];
  let points = 24;
  let interval = 1; // hours

  const pattern = hostPatterns[hostId] || hostPatterns.all;
  // Create a seed based on hostId for consistent but different random patterns
  const seed = hostId
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  switch (range) {
    case "24h":
      points = 24;
      interval = 1;
      break;
    case "7d":
      points = 7;
      interval = 24;
      break;
    case "30d":
      points = 30;
      interval = 24;
      break;
    case "3m":
      points = 12;
      interval = 24 * 7;
      break;
  }

  for (let i = points - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * interval * 60 * 60 * 1000);
    const timeLabel =
      range === "24h"
        ? date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : range === "7d" || range === "30d"
        ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : date.toLocaleDateString("en-US", { month: "short" });

    // Generate pseudo-random but consistent values based on index and seed
    const pseudoRandom = Math.sin(seed + i * 0.5) * 0.5 + 0.5;
    // Scale up to get whole numbers (multiply by 10, then round)
    const attacksScaled = (pattern.attackBase + pseudoRandom * pattern.variance) * 10;
    const attacks = Math.max(1, Math.round(attacksScaled)); // Ensure at least 1
    const blocked = Math.max(0, Math.round(attacks * pattern.blockRate)); // Round to whole number
    const allowed = attacks - blocked;

    data.push({
      time: timeLabel,
      attacks,
      blocked,
      allowed,
    });
  }

  return data;
}

export function AttackChart({ hostId = "all" }: AttackChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");
  const { theme } = useTheme();
  const data = useMemo(
    () => generateData(timeRange, hostId),
    [timeRange, hostId]
  );

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Attack Trends
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Security events over time
          </p>
        </div>
        <TimeFilter selected={timeRange} onChange={setTimeRange} />
      </div>

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

      <div className="mt-4 flex gap-6 text-sm">
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
