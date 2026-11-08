"use client";

import { ReactNode, useEffect, useState } from "react";
import { type LogEntry } from "@/data/logs";
import { ActionBadge, SeverityBadge } from "@/components/dashboard/dashboardUi";

interface LogDetailPanelProps {
  log: LogEntry | null;
  onClose: () => void;
}

function formatTimestamp(timestamp: string) {
  return new Date(timestamp).toLocaleString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(value).then(() => setCopied(true), () => undefined);
      }}
      aria-label={`Copy ${label}`}
      className="shrink-0 cursor-pointer rounded-md px-2 py-1 text-[11px] font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/[0.06] dark:hover:text-white"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-b border-gray-100 px-6 py-5 last:border-0 dark:border-white/[0.06]">
      <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[96px_1fr] items-start gap-3 py-1.5">
      <dt className="text-[13px] text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className="min-w-0 text-[13px] text-gray-900 dark:text-gray-100">{children}</dd>
    </div>
  );
}

function CodeBlock({ children }: { children: ReactNode }) {
  return (
    <pre className="max-h-72 overflow-auto rounded-lg border border-gray-100 bg-gray-50 p-3 font-mono text-[12px] leading-5 whitespace-pre-wrap break-all text-gray-800 dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-gray-200">
      {children}
    </pre>
  );
}

export function LogDetailPanel({ log, onClose }: LogDetailPanelProps) {
  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Prevent body scroll while the panel is open
  useEffect(() => {
    document.body.style.overflow = log ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [log]);

  if (!log) return null;

  const hasRuleId = Boolean(log.ruleId) && log.ruleId !== "-";
  const headerCount = log.headers ? Object.keys(log.headers).length : 0;

  return (
    <>
      <div
        className="fixed inset-0 z-[50] bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Event details"
        className="animate-slide-in fixed right-0 top-0 z-[60] flex h-full w-full max-w-xl flex-col border-l border-gray-200 bg-white shadow-2xl dark:border-white/[0.08] dark:bg-[#111113]"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5 dark:border-white/[0.06]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <SeverityBadge severity={log.severity} />
              <ActionBadge action={log.action} />
              {log.responseCode ? (
                <span className="rounded-md border border-gray-200 px-1.5 py-0.5 font-mono text-[11px] text-gray-600 dark:border-white/10 dark:text-gray-300">
                  HTTP {log.responseCode}
                </span>
              ) : null}
            </div>
            <h2 className="mt-2.5 text-[17px] font-semibold leading-snug tracking-tight text-gray-900 dark:text-white">
              {log.ruleName || "WAF event"}
            </h2>
            <p className="mt-1 text-[13px] text-gray-500 dark:text-gray-400">
              {formatTimestamp(log.timestamp)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/[0.06] dark:hover:text-white"
            aria-label="Close panel"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <Section title="Request">
            <dl>
              <Field label="Method">
                <span className="font-mono">{log.method}</span>
              </Field>
              <Field label="Host">{log.host || "—"}</Field>
            </dl>
            <div className="mt-2 flex items-start gap-2 rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-white/[0.06] dark:bg-white/[0.03]">
              <code className="min-w-0 flex-1 break-all font-mono text-[12px] leading-5 text-gray-800 dark:text-gray-200">
                {log.requestUri}
              </code>
              <CopyButton value={log.requestUri} label="request URI" />
            </div>
          </Section>

          <Section title="Source">
            <dl>
              <Field label="IP address">
                <span className="flex items-center justify-between gap-2">
                  <span className="font-mono">{log.clientIp}</span>
                  <CopyButton value={log.clientIp} label="IP address" />
                </span>
              </Field>
              <Field label="Country">{log.clientCountry || "Unknown"}</Field>
            </dl>
          </Section>

          <Section title="Rule">
            <dl>
              <Field label="Rule ID">
                <span className="font-mono">{hasRuleId ? log.ruleId : "—"}</span>
              </Field>
              <Field label="Description">{log.ruleName || "—"}</Field>
            </dl>
          </Section>

          {log.userAgent ? (
            <Section title="User agent">
              <CodeBlock>{log.userAgent}</CodeBlock>
            </Section>
          ) : null}

          <Section title={`Headers${headerCount ? ` (${headerCount})` : ""}`}>
            {headerCount ? (
              <CodeBlock>{JSON.stringify(log.headers, null, 2)}</CodeBlock>
            ) : (
              <p className="text-[13px] text-gray-500 dark:text-gray-400">No headers recorded.</p>
            )}
          </Section>

          {log.requestBody ? (
            <Section title="Request body">
              <CodeBlock>{log.requestBody}</CodeBlock>
            </Section>
          ) : null}
        </div>
      </aside>

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
