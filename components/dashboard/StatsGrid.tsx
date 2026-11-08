"use client";

import { ReactNode, useMemo, useState } from "react";
import { TimeFilter, RANGE_LABEL, type TimeRange } from "./TimeFilter";
import { useLogAnalytics } from "@/lib/api/hooks/useLogs";
import { StatsGridSkeleton } from "@/components/ui/Skeleton";
import {
  Card,
  Sparkline,
  THREAT_COLOR,
  THREAT_LEVELS,
  type ThreatLevel,
  useChartColors,
} from "./dashboardUi";

interface StatsGridProps {
  hostId?: string;
  /**
   * Controlled time range. When omitted the grid shows its own range filter,
   * for pages that do not have a shared one.
   */
  range?: TimeRange;
}

const icons = {
  events: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h4l3-8 4 16 3-8h4" />
  ),
  blocked: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3zM9.5 12.5l2 2 3.5-4"
    />
  ),
  allowed: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12zM12 14.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
    />
  ),
  threat: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v4m0 3.5h.01M10.3 3.9L2.4 17.5A2 2 0 004.1 20.5h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"
    />
  ),
};

function Tile({
  label,
  icon,
  value,
  valueClassName = "",
  sub,
  footer,
}: {
  label: string;
  icon: ReactNode;
  value: ReactNode;
  valueClassName?: string;
  sub: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-gray-500 dark:text-gray-400">{label}</span>
        <svg
          className="h-4 w-4 text-gray-400 dark:text-gray-500"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          {icon}
        </svg>
      </div>
      <div
        className={`mt-3 text-[28px] font-semibold leading-none tracking-tight text-gray-900 dark:text-white ${valueClassName}`}
      >
        {value}
      </div>
      <div className="mt-2 min-h-[18px] truncate text-[12px] text-gray-500 dark:text-gray-400">
        {sub}
      </div>
      <div className="mt-4 h-8">{footer}</div>
    </Card>
  );
}

/** Four-step meter so the threat level is readable without relying on color. */
function ThreatMeter({ level }: { level: ThreatLevel }) {
  const activeIndex = THREAT_LEVELS.indexOf(level);
  return (
    <div className="flex h-8 items-end gap-1" aria-hidden="true">
      {THREAT_LEVELS.map((step, index) => (
        <div
          key={step}
          className="h-1.5 flex-1 rounded-full bg-gray-100 dark:bg-white/[0.08]"
          style={index <= activeIndex ? { backgroundColor: THREAT_COLOR[level] } : undefined}
        />
      ))}
    </div>
  );
}

export function StatsGrid({ hostId = "all", range }: StatsGridProps) {
  const [ownRange, setOwnRange] = useState<TimeRange>("24h");
  const timeRange = range ?? ownRange;
  const colors = useChartColors();
  const { data: analytics, isLoading, isError } = useLogAnalytics({
    range: timeRange,
    host: hostId !== "all" ? hostId : undefined,
  });

  const summary = useMemo(() => {
    const series = analytics?.series ?? [];
    const total = analytics?.summary.totalRequests ?? 0;
    const blocked = analytics?.summary.blockedAttacks ?? 0;
    const allowed = analytics?.summary.allowedRequests ?? 0;
    return {
      total,
      blocked,
      allowed,
      blockRate: total > 0 ? (blocked / total) * 100 : null,
      threatLevel: (analytics?.summary.threatLevel ?? "Low") as ThreatLevel,
      topRule: analytics?.summary.topRule ?? null,
      eventsSeries: series.map((point) => point.attacks),
      blockedSeries: series.map((point) => point.blocked),
      allowedSeries: series.map((point) => point.allowed),
    };
  }, [analytics]);

  const formatNumber = (value: number) => Math.round(value).toLocaleString();

  const content =
    isError && !analytics ? (
      <Card className="px-5 py-8 text-sm text-gray-600 dark:text-gray-300">
        Overview metrics could not be loaded. The dashboard will retry automatically.
      </Card>
    ) : isLoading ? (
      <StatsGridSkeleton />
    ) : (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Tile
          label="Security events"
          icon={icons.events}
          value={formatNumber(summary.total)}
          sub={`In the ${RANGE_LABEL[timeRange]}`}
          footer={
            <Sparkline values={summary.eventsSeries} color={colors.neutral} className="h-8 w-full" />
          }
        />
        <Tile
          label="Blocked"
          icon={icons.blocked}
          value={formatNumber(summary.blocked)}
          sub={
            summary.blockRate === null
              ? "No events yet"
              : `${summary.blockRate.toFixed(summary.blockRate >= 99.95 || summary.blockRate === 0 ? 0 : 1)}% of events blocked`
          }
          footer={
            <Sparkline values={summary.blockedSeries} color={colors.blocked} className="h-8 w-full" />
          }
        />
        <Tile
          label="Allowed"
          icon={icons.allowed}
          value={formatNumber(summary.allowed)}
          sub="Detected and logged, not blocked"
          footer={
            <Sparkline values={summary.allowedSeries} color={colors.allowed} className="h-8 w-full" />
          }
        />
        <Tile
          label="Threat level"
          icon={icons.threat}
          value={
            <span className="inline-flex items-center gap-2.5">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: THREAT_COLOR[summary.threatLevel] }}
                aria-hidden="true"
              />
              {summary.threatLevel}
            </span>
          }
          sub={
            summary.topRule ? (
              <span title={summary.topRule.ruleName}>
                Top rule {summary.topRule.ruleId} · {formatNumber(summary.topRule.count)} hits
              </span>
            ) : (
              "No rules triggered"
            )
          }
          footer={<ThreatMeter level={summary.threatLevel} />}
        />
      </div>
    );

  if (range !== undefined) {
    return (
      <div>
        {isError && analytics ? (
          <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Reconnecting…</p>
        ) : null}
        {content}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
            Overview
          </h2>
          <p className="text-[13px] text-gray-500 dark:text-gray-400">
            Key security metrics, {RANGE_LABEL[timeRange]}
            {isError && analytics ? " · reconnecting" : ""}
          </p>
        </div>
        <TimeFilter selected={timeRange} onChange={setOwnRange} />
      </div>
      {content}
    </div>
  );
}
