"use client";

import { useEffect } from "react";
import { type LogEntry } from "@/data/logs";

interface LogDetailPanelProps {
  log: LogEntry | null;
  onClose: () => void;
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

function SeverityBadge({ severity }: { severity: LogEntry["severity"] }) {
  const styles = {
    critical: "bg-red-500 text-white",
    high: "bg-orange-500 text-white",
    medium: "bg-yellow-500 text-gray-900",
    low: "bg-gray-400 dark:bg-gray-600 text-white",
  };

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

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-4 border-b border-gray-200 dark:border-gray-800 last:border-0">
      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
        {label}
      </dt>
      <dd className="text-sm text-gray-900 dark:text-white">{children}</dd>
    </div>
  );
}

export function LogDetailPanel({ log, onClose }: LogDetailPanelProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (log) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [log]);

  if (!log) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 z-50 shadow-2xl overflow-y-auto animate-slide-in">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Event Details
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Complete information about this WAF event
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close panel"
          >
            <svg
              className="w-5 h-5 text-gray-500 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {/* Action & Severity badges */}
          <div className="flex items-center gap-6 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Action
              </span>
              <ActionBadge action={log.action} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Severity
              </span>
              <SeverityBadge severity={log.severity} />
            </div>
          </div>

          {/* Details */}
          <dl>
            <DetailRow label="Timestamp">
              {formatTimestamp(log.timestamp)}
            </DetailRow>

            <DetailRow label="Client IP">
              <span className="font-mono">{log.clientIp}</span>
              <span className="text-gray-500 dark:text-gray-400 ml-2">
                ({log.clientCountry})
              </span>
            </DetailRow>

            <DetailRow label="Host">{log.host}</DetailRow>

            <DetailRow label="Method">
              <span className="font-mono">{log.method}</span>
            </DetailRow>

            <DetailRow label="Request URI">
              <span className="font-mono text-xs break-all">{log.requestUri}</span>
            </DetailRow>

            <DetailRow label="Rule">
              {log.ruleName}
              {log.ruleId !== "-" && (
                <span className="text-gray-500 dark:text-gray-400 ml-2">
                  ({log.ruleId})
                </span>
              )}
            </DetailRow>

            <DetailRow label="User Agent">
              <span className="text-xs break-all">{log.userAgent}</span>
            </DetailRow>

            <DetailRow label="Headers">
              <div className="mt-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto">
                <pre className="text-xs font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {JSON.stringify(log.headers, null, 2)}
                </pre>
              </div>
            </DetailRow>

            {log.requestBody && (
              <DetailRow label="Request Body">
                <div className="mt-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-xs font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-all">
                    {log.requestBody}
                  </pre>
                </div>
              </DetailRow>
            )}
          </dl>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.2s ease-out;
        }
      `}</style>
    </>
  );
}

