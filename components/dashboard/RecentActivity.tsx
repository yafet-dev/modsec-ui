"use client";

import Link from "next/link";
import { useLogs } from "@/lib/api/hooks/useLogs";
import { ActionBadge, Card, CardHeader, SeverityBadge } from "./dashboardUi";

interface RecentActivityProps {
  hostId?: string;
  /** Where "View all" goes; omit to hide the link. */
  logsHref?: string;
  limit?: number;
}

function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const diffSec = Math.round((Date.now() - then) / 1000);
  if (diffSec < 45) return "Just now";
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function RecentActivity({ hostId = "all", logsHref, limit = 8 }: RecentActivityProps) {
  const { data, isLoading, isError } = useLogs({
    page: 1,
    limit,
    host: hostId !== "all" ? hostId : undefined,
  });
  const logs = data?.logs ?? [];

  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        title="Recent activity"
        subtitle="Latest WAF events"
        right={
          logsHref ? (
            <Link
              href={logsHref}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[13px] font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/[0.06] dark:hover:text-white"
            >
              View all
              <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 5l5 5-5 5" />
              </svg>
            </Link>
          ) : null
        }
      />

      <div className="flex-1 overflow-y-auto lg:max-h-[360px]">
        {isLoading ? (
          <ul className="divide-y divide-gray-100 dark:divide-white/[0.06]" aria-busy="true">
            {Array.from({ length: 6 }).map((_, index) => (
              <li key={index} className="px-5 py-3.5">
                <div className="h-3.5 w-2/3 animate-pulse rounded bg-gray-100 dark:bg-white/[0.06]" />
                <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-gray-100 dark:bg-white/[0.06]" />
              </li>
            ))}
          </ul>
        ) : isError && logs.length === 0 ? (
          <p className="px-5 py-10 text-center text-[13px] text-gray-500 dark:text-gray-400">
            Recent events could not be loaded. Retrying automatically.
          </p>
        ) : logs.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-5 py-12 text-center">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-gray-100 dark:bg-white/[0.06]">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z" />
              </svg>
            </div>
            <p className="mt-3 text-[13px] font-medium text-gray-900 dark:text-white">All quiet</p>
            <p className="mt-0.5 text-[12px] text-gray-500 dark:text-gray-400">
              No WAF events for this selection.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-white/[0.06]">
            {logs.map((log) => {
              const title = log.ruleName || `${log.method} ${log.requestUri}`;
              return (
                <li
                  key={log.id}
                  className="px-5 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p
                      className="min-w-0 truncate text-[13px] font-medium text-gray-900 dark:text-white"
                      title={title}
                    >
                      {title}
                    </p>
                    <span className="shrink-0 text-[12px] tabular-nums text-gray-400 dark:text-gray-500">
                      {formatRelativeTime(log.timestamp)}
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <SeverityBadge severity={log.severity} />
                    <ActionBadge action={log.action} />
                    <span className="min-w-0 truncate font-mono text-[12px] text-gray-500 dark:text-gray-400">
                      {log.clientIp}
                    </span>
                    {log.host ? (
                      <span className="min-w-0 truncate text-[12px] text-gray-400 dark:text-gray-500">
                        · {log.host}
                      </span>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Card>
  );
}
