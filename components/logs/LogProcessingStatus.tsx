"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLogProcessingStatus } from "@/lib/api/hooks/useLogs";

interface LogProcessingStatusProps {
  host?: string;
}

export function LogProcessingStatus({ host }: LogProcessingStatusProps) {
  const queryClient = useQueryClient();
  const previousStatus = useRef<{ scope: string; pendingCount: number } | null>(
    null
  );
  const { data, isLoading, isError, failureCount } =
    useLogProcessingStatus(host);

  useEffect(() => {
    const pendingCount = data?.pendingCount;
    if (pendingCount === undefined) return;
    const scope = host ?? "all";

    if (
      previousStatus.current?.scope === scope &&
      previousStatus.current.pendingCount > 0 &&
      pendingCount === 0
    ) {
      void queryClient.invalidateQueries({ queryKey: ["logs"] });
      void queryClient.invalidateQueries({ queryKey: ["log-analytics"] });
      void queryClient.invalidateQueries({ queryKey: ["log-hosts"] });
    }

    previousStatus.current = { scope, pendingCount };
  }, [data?.pendingCount, host, queryClient]);

  const lastChecked = data
    ? (() => {
        const date = new Date(data.checkedAt);
        return Number.isNaN(date.getTime())
          ? null
          : date.toLocaleTimeString(undefined, {
              hour: "numeric",
              minute: "2-digit",
            });
      })()
    : null;

  if (isLoading && !data) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="mb-8 flex items-center gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-4 dark:border-gray-800 dark:bg-gray-900"
      >
        <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800" />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-gray-700 dark:text-gray-200">
            {failureCount > 0
              ? "The processing queue is taking longer than expected…"
              : "Checking the processing queue…"}
          </p>
          {failureCount > 0 ? (
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              Visible logs remain available while we try once more.
            </p>
          ) : (
            <div className="mt-2 h-2.5 w-64 max-w-full animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
          )}
        </div>
      </div>
    );
  }

  if (isError && !data) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="mb-8 flex items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 dark:border-amber-900/50 dark:bg-amber-950/20"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-amber-900 dark:text-amber-100">
            Processing status unavailable
          </p>
          <p className="mt-0.5 text-sm text-amber-700 dark:text-amber-300">
            The queue check timed out or could not be completed. Visible logs
            are unaffected, and we’ll keep retrying automatically.
          </p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  if (data.pendingCount === 0) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="mb-8 flex items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 dark:border-emerald-900/50 dark:bg-emerald-950/20"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-emerald-950 dark:text-emerald-100">
            {isError
              ? "Last known status: logs were up to date"
              : "Logs are up to date"}
          </p>
          <p className="mt-0.5 text-sm text-emerald-700 dark:text-emerald-300">
            {isError
              ? `The queue could not be refreshed${lastChecked ? `; last checked at ${lastChecked}` : ""}. We’ll keep retrying automatically.`
              : "No WAF events for your organization are waiting to sync."}
          </p>
        </div>
        {isError && (
          <span className="hidden rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 sm:inline-flex">
            Reconnecting
          </span>
        )}
      </div>
    );
  }

  const count = data.pendingCount.toLocaleString();
  const eventLabel = data.pendingCount === 1 ? "event" : "events";
  const stateLabel = isError
    ? "Reconnecting"
    : data.isProcessing
      ? "Processing now"
      : "Queued";

  return (
    <div
      role="status"
      aria-live="polite"
      className="relative mb-8 overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-violet-50 px-5 py-5 dark:border-blue-900/60 dark:from-blue-950/30 dark:via-indigo-950/25 dark:to-violet-950/20"
    >
      <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-blue-500 to-violet-500" />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
          <span className="absolute inset-0 animate-ping rounded-2xl bg-blue-400 opacity-20" />
          <svg className="relative h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-lg font-semibold text-blue-950 dark:text-blue-100">
            {isError ? "Last known: " : ""}
            {count} WAF {eventLabel}{" "}
            {!isError && data.isProcessing ? "processing" : "waiting to sync"}
          </p>
          <p className="mt-1 text-sm leading-5 text-blue-700 dark:text-blue-300">
            {isError ? (
              <>
                The queue could not be refreshed
                {lastChecked ? `; last checked at ${lastChecked}` : ""}. We’ll
                keep retrying automatically.
              </>
            ) : (
              <>
                Incoming security events for your organization are being
                normalized and will appear in Logs and Dashboard metrics
                automatically.
              </>
            )}
          </p>
        </div>

        <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-sm dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-200">
          <span className={`h-2 w-2 rounded-full ${isError ? "bg-amber-500" : "animate-pulse bg-blue-500"}`} />
          {stateLabel}
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-0.5 animate-pulse bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
    </div>
  );
}
