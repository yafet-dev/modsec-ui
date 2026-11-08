"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartSkeleton } from "@/components/ui/Skeleton";
import { TimeFilter, RANGE_LABEL, type TimeRange } from "./TimeFilter";
import { useLogAnalytics } from "@/lib/api/hooks/useLogs";
import { Card, CardHeader, formatCompact, useChartColors } from "./dashboardUi";

interface DataPoint {
  label: string;
  fullLabel: string;
  blocked: number;
  allowed: number;
  total: number;
}

interface AttackChartProps {
  hostId?: string;
  /**
   * Controlled time range. When omitted the chart shows its own range filter,
   * for pages that do not have a shared one.
   */
  range?: TimeRange;
}

function formatPoint(timestamp: Date, range: TimeRange): { label: string; fullLabel: string } {
  if (range === "24h") {
    const hour = timestamp.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });
    const next = new Date(timestamp.getTime() + 60 * 60 * 1000).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });
    const day = timestamp.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    return { label: hour, fullLabel: `${day}, ${hour} – ${next}` };
  }

  const day = timestamp.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  if (range === "3m") {
    return { label: day, fullLabel: `Week of ${day}` };
  }
  return {
    label: day,
    fullLabel: timestamp.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    }),
  };
}

interface SegmentProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: string;
  payload?: DataPoint;
}

/**
 * A stacked segment with rounded data-end corners only on the top of the
 * stack, and a 2px gap between the two segments so they read as separate.
 */
function Segment({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  fill,
  roundTop,
  gapBelow,
}: SegmentProps & { roundTop: boolean; gapBelow: boolean }) {
  const h = gapBelow ? height - 2 : height;
  if (h <= 0 || width <= 0) return <g />;
  const r = roundTop ? Math.min(4, width / 2, h) : 0;
  const d = [
    `M${x},${y + h}`,
    `L${x},${y + r}`,
    r ? `Q${x},${y} ${x + r},${y}` : "",
    `L${x + width - r},${y}`,
    r ? `Q${x + width},${y} ${x + width},${y + r}` : "",
    `L${x + width},${y + h}`,
    "Z",
  ].join(" ");
  return <path d={d} fill={fill} />;
}

function TrendTooltip({
  active,
  payload,
  colors,
}: {
  active?: boolean;
  payload?: Array<{ payload: DataPoint }>;
  colors: { blocked: string; allowed: string };
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  const rows = [
    { key: "Blocked", value: point.blocked, color: colors.blocked },
    { key: "Allowed", value: point.allowed, color: colors.allowed },
  ];
  return (
    <div className="min-w-[180px] rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-[12px] shadow-lg dark:border-white/10 dark:bg-[#1a1a1c]">
      <div className="mb-2 font-medium text-gray-900 dark:text-white">{point.fullLabel}</div>
      <div className="space-y-1.5">
        {rows.map((row) => (
          <div key={row.key} className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: row.color }} />
              {row.key}
            </span>
            <span className="font-medium tabular-nums text-gray-900 dark:text-white">
              {row.value.toLocaleString()}
            </span>
          </div>
        ))}
        <div className="mt-1 flex items-center justify-between gap-6 border-t border-gray-100 pt-1.5 dark:border-white/10">
          <span className="text-gray-500 dark:text-gray-400">Total</span>
          <span className="font-semibold tabular-nums text-gray-900 dark:text-white">
            {point.total.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

export function AttackChart({ hostId = "all", range }: AttackChartProps) {
  const [ownRange, setOwnRange] = useState<TimeRange>("24h");
  const timeRange = range ?? ownRange;
  const colors = useChartColors();
  const { data: analytics, isLoading, isError } = useLogAnalytics({
    range: timeRange,
    host: hostId !== "all" ? hostId : undefined,
  });

  const data = useMemo<DataPoint[]>(
    () =>
      (analytics?.series ?? []).map((point) => ({
        ...formatPoint(new Date(point.timestamp), timeRange),
        blocked: point.blocked,
        allowed: point.allowed,
        total: point.attacks,
      })),
    [analytics, timeRange]
  );

  const totals = useMemo(
    () => ({
      blocked: analytics?.summary.blockedAttacks ?? 0,
      allowed: analytics?.summary.allowedRequests ?? 0,
    }),
    [analytics]
  );

  if (isLoading) {
    return <ChartSkeleton />;
  }

  if (isError && !analytics) {
    return (
      <Card className="px-5 py-8 text-sm text-gray-600 dark:text-gray-300">
        Attack trends could not be loaded. The dashboard will retry automatically.
      </Card>
    );
  }

  const isEmpty = totals.blocked + totals.allowed === 0;

  const legend = (
    <div className="flex items-center gap-5">
      {[
        { key: "Blocked", value: totals.blocked, color: colors.blocked },
        { key: "Allowed", value: totals.allowed, color: colors.allowed },
      ].map((item) => (
        <div key={item.key} className="flex items-center gap-2 text-[13px]">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
          <span className="text-gray-500 dark:text-gray-400">{item.key}</span>
          <span className="font-semibold tabular-nums text-gray-900 dark:text-white">
            {item.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        title="Attack trends"
        subtitle={`Blocked and allowed events, ${RANGE_LABEL[timeRange]}${
          isError && analytics ? " · reconnecting" : ""
        }`}
        right={
          range === undefined ? (
            <div className="flex flex-col items-start gap-3 sm:items-end">
              <TimeFilter selected={timeRange} onChange={setOwnRange} />
              {legend}
            </div>
          ) : (
            legend
          )
        }
      />

      <div className="relative flex-1 px-2 pb-3 pt-5 sm:px-4">
        <ResponsiveContainer width="100%" height={300} initialDimension={{ width: 800, height: 300 }}>
          <BarChart data={data} barCategoryGap="22%" margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={colors.grid} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={{ stroke: colors.baseline }}
              tick={{ fill: colors.muted, fontSize: 11 }}
              interval="preserveStartEnd"
              minTickGap={18}
              tickMargin={8}
            />
            <YAxis
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              width={44}
              tick={{ fill: colors.muted, fontSize: 11 }}
              tickFormatter={(value: number) => formatCompact(value)}
            />
            <Tooltip
              cursor={{ fill: colors.surface === "#ffffff" ? "rgba(0,0,0,0.035)" : "rgba(255,255,255,0.05)" }}
              content={<TrendTooltip colors={colors} />}
              isAnimationActive={false}
            />
            <Bar
              dataKey="blocked"
              stackId="events"
              fill={colors.blocked}
              maxBarSize={28}
              shape={(props: unknown) => {
                const segment = props as SegmentProps;
                return (
                  <Segment
                    {...segment}
                    roundTop={(segment.payload?.allowed ?? 0) === 0}
                    gapBelow={false}
                  />
                );
              }}
            />
            <Bar
              dataKey="allowed"
              stackId="events"
              fill={colors.allowed}
              maxBarSize={28}
              shape={(props: unknown) => {
                const segment = props as SegmentProps;
                return (
                  <Segment {...segment} roundTop gapBelow={(segment.payload?.blocked ?? 0) > 0} />
                );
              }}
            />
          </BarChart>
        </ResponsiveContainer>

        {isEmpty ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <p className="rounded-lg border border-gray-200 bg-white/90 px-3.5 py-2 text-[13px] text-gray-500 backdrop-blur dark:border-white/10 dark:bg-[#111113]/90 dark:text-gray-400">
              No security events in the {RANGE_LABEL[timeRange]}
            </p>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
