"use client";

import { type LogEntry } from "@/data/logs";

interface LogsTableProps {
  logs: LogEntry[];
  onSelectLog: (log: LogEntry) => void;
}

function SeverityBadge({ severity }: { severity: LogEntry["severity"] }) {
  const styles = {
    critical: "bg-red-500 text-white",
    high: "bg-orange-500 text-white",
    medium: "bg-yellow-500 text-gray-900",
    low: "text-gray-500 dark:text-gray-400",
  };

  if (severity === "low") {
    return (
      <span className={`text-sm ${styles[severity]}`}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${styles[severity]}`}
    >
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </span>
  );
}

function ActionBadge({ action }: { action: LogEntry["action"] }) {
  const styles = {
    blocked: "bg-red-500 text-white",
    warning: "bg-green-500 text-white",
  };

  const labels = {
    blocked: "Blocked",
    warning: "Allowed",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${styles[action]}`}
    >
      {labels[action]}
    </span>
  );
}

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

export function LogsTable({ logs, onSelectLog }: LogsTableProps) {
  if (logs.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center">
        <svg
          className="w-12 h-12 text-gray-400 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No logs found
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Client IP
              </th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Request URI
              </th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Rule
              </th>
              <th className="text-center px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Severity
              </th>
              <th className="text-center px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {logs.map((log) => (
              <tr
                key={log.id}
                onClick={() => onSelectLog(log)}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
              >
                <td className="px-6 py-5">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatTimestamp(log.timestamp)}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <span className="text-sm font-mono font-medium text-gray-900 dark:text-white">
                    {log.clientIp}
                  </span>
                </td>
                <td className="px-6 py-5 max-w-xs">
                  <span className="text-sm text-gray-600 dark:text-gray-300 truncate block">
                    {log.requestUri}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {log.ruleName}
                    </p>
                    {log.ruleId !== "-" && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {log.ruleId}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex justify-center">
                    <SeverityBadge severity={log.severity} />
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex justify-center">
                    <ActionBadge action={log.action} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

