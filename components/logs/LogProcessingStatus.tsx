"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLogProcessingStatus } from "@/lib/api/hooks/useLogs";
import { CARD_CLASS } from "@/components/dashboard/dashboardUi";

interface LogProcessingStatusProps {
  host?: string;
}

type Tone = "neutral" | "good" | "warning" | "active";

const DOT: Record<Tone, string> = {
  neutral: "bg-gray-300 dark:bg-gray-600",
  good: "bg-emerald-500",
  warning: "bg-amber-500",
  active: "bg-blue-500",
};

/** One-line queue status in the dashboard card style. */
function StatusLine({
  tone,
  title,
  detail,
  badge,
  pulse = false,
  progress = false,
}: {
  tone: Tone;
  title: string;
  detail?: string;
  badge?: string;
  pulse?: boolean;
  progress?: boolean;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`${CARD_CLASS} relative mb-4 flex items-center gap-3 overflow-hidden px-4 py-3`}
    >
      <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
        {pulse ? (
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${DOT[tone]}`} />
        ) : null}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${DOT[tone]}`} />
      </span>
      <p className="min-w-0 flex-1 truncate text-[13px]">
        <span className="font-medium text-gray-900 dark:text-white">{title}</span>
        {detail ? <span className="text-gray-500 dark:text-gray-400"> · {detail}</span> : null}
      </p>
      {badge ? (
        <span className="hidden shrink-0 rounded-md border border-gray-200 px-2 py-0.5 text-[11px] font-medium text-gray-600 sm:inline-flex dark:border-white/10 dark:text-gray-300">
          {badge}
        </span>
      ) : null}
      {progress ? (
        <span className="absolute inset-x-0 bottom-0 h-0.5 animate-pulse bg-blue-500/70" aria-hidden="true" />
      ) : null}
    </div>
  );
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
      <StatusLine
        tone="neutral"
        pulse
        title={
          failureCount > 0
            ? "The processing queue is taking longer than expected"
            : "Checking the processing queue"
        }
        detail={failureCount > 0 ? "visible logs remain available" : undefined}
      />
    );
  }

  if (isError && !data) {
    return (
      <StatusLine
        tone="warning"
        title="Processing status unavailable"
        detail="visible logs are unaffected, retrying automatically"
        badge="Reconnecting"
      />
    );
  }

  if (!data) return null;

  if (data.pendingCount === 0) {
    return (
      <StatusLine
        tone={isError ? "warning" : "good"}
        title={isError ? "Last known status: logs were up to date" : "Logs are up to date"}
        detail={
          isError
            ? `could not refresh${lastChecked ? `, last checked ${lastChecked}` : ""}`
            : "no events waiting to sync"
        }
        badge={isError ? "Reconnecting" : undefined}
      />
    );
  }

  const count = data.pendingCount.toLocaleString();
  const eventLabel = data.pendingCount === 1 ? "event" : "events";

  return (
    <StatusLine
      tone={isError ? "warning" : "active"}
      pulse={!isError}
      progress={!isError && data.isProcessing}
      title={`${isError ? "Last known: " : ""}${count} ${eventLabel} ${
        !isError && data.isProcessing ? "processing" : "waiting to sync"
      }`}
      detail={
        isError
          ? `could not refresh${lastChecked ? `, last checked ${lastChecked}` : ""}`
          : "they will appear in Logs and the Dashboard automatically"
      }
      badge={isError ? "Reconnecting" : data.isProcessing ? "Processing now" : "Queued"}
    />
  );
}
