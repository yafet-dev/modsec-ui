"use client";

import { ReactNode } from "react";
import { type LogEntry } from "@/data/logs";
import {
  ActionBadge,
  Card,
  CardHeader,
  SeverityBadge,
} from "@/components/dashboard/dashboardUi";

interface LogsTableProps {
  logs: LogEntry[];
  onSelectLog: (log: LogEntry) => void;
  /** Optional card header. */
  title?: string;
  subtitle?: ReactNode;
  /** Optional card footer, such as pagination. */
  footer?: ReactNode;
  /** Show placeholder rows instead of data. */
  isLoading?: boolean;
  /** Message shown instead of rows when loading failed. */
  errorMessage?: string;
}

const COLUMNS = ["Time", "Severity", "Action", "Source IP", "Request", "Rule"];

function formatDate(timestamp: string) {
  return new Date(timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
}

function hasRuleId(ruleId: string) {
  return Boolean(ruleId) && ruleId !== "-";
}

function MethodTag({ method }: { method: string }) {
  return (
    <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-gray-600 dark:bg-white/[0.06] dark:text-gray-300">
      {method}
    </span>
  );
}

function EmptyState({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="grid h-11 w-11 place-items-center rounded-full bg-gray-100 dark:bg-white/[0.06]">
        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5-5m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <p className="mt-3 text-[14px] font-medium text-gray-900 dark:text-white">
        {message ? "Logs could not be loaded" : "No matching events"}
      </p>
      <p className="mt-1 text-[13px] text-gray-500 dark:text-gray-400">
        {message ?? "Try a different search or clear a filter."}
      </p>
    </div>
  );
}

function LoadingRows() {
  return (
    <ul className="divide-y divide-gray-100 dark:divide-white/[0.06]" aria-busy="true">
      {Array.from({ length: 8 }).map((_, index) => (
        <li key={index} className="flex items-center gap-6 px-5 py-4">
          <div className="h-3.5 w-20 animate-pulse rounded bg-gray-100 dark:bg-white/[0.06]" />
          <div className="h-3.5 w-16 animate-pulse rounded bg-gray-100 dark:bg-white/[0.06]" />
          <div className="h-3.5 w-24 animate-pulse rounded bg-gray-100 dark:bg-white/[0.06]" />
          <div className="h-3.5 flex-1 animate-pulse rounded bg-gray-100 dark:bg-white/[0.06]" />
        </li>
      ))}
    </ul>
  );
}

export function LogsTable({
  logs,
  onSelectLog,
  title,
  subtitle,
  footer,
  isLoading = false,
  errorMessage,
}: LogsTableProps) {
  const onRowKey = (event: React.KeyboardEvent, log: LogEntry) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelectLog(log);
    }
  };

  let body: ReactNode;
  if (isLoading) {
    body = <LoadingRows />;
  } else if (errorMessage) {
    body = <EmptyState message={errorMessage} />;
  } else if (logs.length === 0) {
    body = <EmptyState />;
  } else {
    body = (
      <>
        {/* Small screens: compact rows */}
        <ul className="divide-y divide-gray-100 md:hidden dark:divide-white/[0.06]">
          {logs.map((log) => (
            <li key={log.id}>
              <button
                type="button"
                onClick={() => onSelectLog(log)}
                className="w-full cursor-pointer px-4 py-3.5 text-left transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.03]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <SeverityBadge severity={log.severity} />
                    <ActionBadge action={log.action} />
                  </div>
                  <time dateTime={log.timestamp} className="shrink-0 text-[12px] tabular-nums text-gray-400">
                    {formatDate(log.timestamp)} {formatTime(log.timestamp)}
                  </time>
                </div>
                <p className="mt-2 truncate text-[13px] font-medium text-gray-900 dark:text-white">
                  {log.ruleName || `${log.method} ${log.requestUri}`}
                </p>
                <p className="mt-1 flex min-w-0 items-center gap-2 text-[12px] text-gray-500 dark:text-gray-400">
                  <span className="font-mono">{log.clientIp}</span>
                  <span className="truncate">{log.host}{log.requestUri}</span>
                </p>
              </button>
            </li>
          ))}
        </ul>

        {/* md and up: data table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[860px] text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60 dark:border-white/[0.06] dark:bg-white/[0.02]">
                {COLUMNS.map((column) => (
                  <th
                    key={column}
                    scope="col"
                    className="whitespace-nowrap px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500 first:pl-5 last:pr-5 dark:text-gray-400"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.06]">
              {logs.map((log) => (
                <tr
                  key={log.id}
                  tabIndex={0}
                  onClick={() => onSelectLog(log)}
                  onKeyDown={(event) => onRowKey(event, log)}
                  className="group cursor-pointer transition-colors hover:bg-gray-50 focus:bg-gray-50 focus:outline-none dark:hover:bg-white/[0.03] dark:focus:bg-white/[0.03]"
                >
                  <td className="whitespace-nowrap py-3 pl-5 pr-4 align-top">
                    <div className="text-[13px] tabular-nums text-gray-900 dark:text-gray-100">
                      {formatTime(log.timestamp)}
                    </div>
                    <div className="text-[12px] text-gray-400 dark:text-gray-500">
                      {formatDate(log.timestamp)}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 align-top">
                    <SeverityBadge severity={log.severity} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 align-top">
                    <ActionBadge action={log.action} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 align-top">
                    <span className="font-mono text-[13px] text-gray-900 dark:text-gray-100">
                      {log.clientIp}
                    </span>
                  </td>
                  <td className="max-w-[320px] px-4 py-3 align-top">
                    <div className="flex min-w-0 items-center gap-2">
                      <MethodTag method={log.method} />
                      <span
                        className="truncate font-mono text-[12px] text-gray-700 dark:text-gray-300"
                        title={log.requestUri}
                      >
                        {log.requestUri}
                      </span>
                    </div>
                    <div className="mt-0.5 truncate text-[12px] text-gray-400 dark:text-gray-500">
                      {log.host}
                    </div>
                  </td>
                  <td className="max-w-[300px] py-3 pl-4 pr-5 align-top">
                    <p
                      className="truncate text-[13px] font-medium text-gray-900 dark:text-white"
                      title={log.ruleName}
                    >
                      {log.ruleName || "—"}
                    </p>
                    {hasRuleId(log.ruleId) ? (
                      <p className="mt-0.5 font-mono text-[12px] text-gray-400 dark:text-gray-500">
                        {log.ruleId}
                      </p>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  return (
    <Card className="overflow-hidden">
      {title ? <CardHeader title={title} subtitle={subtitle} /> : null}
      {body}
      {footer ? (
        <div className="border-t border-gray-100 px-5 py-3 dark:border-white/[0.06]">{footer}</div>
      ) : null}
    </Card>
  );
}
