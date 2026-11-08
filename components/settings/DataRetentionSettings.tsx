"use client";

import { useMemo, useState } from "react";
import { DashButton as Button, CARD_CLASS } from "@/components/dashboard/dashboardUi";
import { useConfirmation } from "@/components/providers/ConfirmationProvider";
import {
  useDataRetention,
  useUpdateDataRetention,
} from "@/lib/api/hooks/useDataRetention";
import type { DataRetentionResponse } from "@/lib/api/dataRetention";
import {
  LOG_RETENTION_PRESETS,
  cutoffDate,
  estimateStorage,
  recommendDatabaseSpec,
} from "@/lib/constants/dataRetention";

interface DataRetentionSettingsProps {
  organizationId: string | null;
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "numeric",
});

/** Same card look as the other settings tabs. */
function Panel({
  className = "",
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`${CARD_CLASS} ${className}`}
    >
      {children}
    </div>
  );
}

export function DataRetentionSettings({
  organizationId,
}: DataRetentionSettingsProps) {
  const { data, isLoading, isError, refetch } =
    useDataRetention(organizationId);

  if (!organizationId) {
    return (
      <Panel className="p-6 text-sm text-gray-500 dark:text-gray-400">
        You need to be a member of an organization to manage data retention.
      </Panel>
    );
  }

  if (isLoading) {
    return <Panel className="h-44 animate-pulse" />;
  }

  if (isError || !data) {
    return (
      <Panel className="flex items-center justify-between gap-4 p-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Could not load data retention.
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Try again
        </Button>
      </Panel>
    );
  }

  // Keyed by the saved values so the form starts fresh after a save.
  return (
    <RetentionForm
      key={`${data.settings.logRetentionDays}-${data.settings.rawRetentionDays}`}
      organizationId={organizationId}
      data={data}
    />
  );
}

function RetentionForm({
  organizationId,
  data,
}: {
  organizationId: string;
  data: DataRetentionResponse;
}) {
  const updateMutation = useUpdateDataRetention(organizationId);
  const { confirm } = useConfirmation();
  const { limits, stats, schedule, canManage } = data;
  const saved = data.settings.logRetentionDays;

  const [days, setDays] = useState(saved);
  const [acknowledged, setAcknowledged] = useState(false);

  const options = useMemo(() => {
    const presets = LOG_RETENTION_PRESETS.filter(
      (preset) =>
        preset.days >= limits.logs.min && preset.days <= limits.logs.max,
    );
    // A value saved through the API may not be a preset; keep it selectable.
    if (!presets.some((preset) => preset.days === saved)) {
      presets.push({ days: saved, label: `${saved} days` });
      presets.sort((a, b) => a.days - b.days);
    }
    return presets;
  }, [limits.logs.min, limits.logs.max, saved]);

  // Raw, unorganized data follows the same period, capped at its maximum.
  const rawDays = Math.min(Math.max(days, limits.raw.min), limits.raw.max);
  const needsLargeDatabase = days > limits.logs.recommendedMax;
  const needsAcknowledgement = needsLargeDatabase && days > saved;
  const dirty = days !== saved;
  const busy = updateMutation.isPending;
  const canSave =
    canManage && dirty && !busy && (!needsAcknowledgement || acknowledged);

  const spec = useMemo(
    () =>
      recommendDatabaseSpec(
        days,
        estimateStorage({
          dailyEvents: stats.dailyEvents,
          avgLogRowBytes: stats.avgLogRowBytes,
          avgRawRowBytes: stats.avgRawRowBytes,
          logDays: days,
          rawDays,
        }),
      ),
    [
      days,
      rawDays,
      stats.dailyEvents,
      stats.avgLogRowBytes,
      stats.avgRawRowBytes,
    ],
  );

  const handleCancel = () => {
    setDays(saved);
    setAcknowledged(false);
  };

  const handleSave = async () => {
    if (days < saved) {
      const confirmed = await confirm({
        title: "Shorten retention?",
        message: `Logs from before ${dateFormatter.format(
          cutoffDate(days),
        )} will be permanently deleted at the next daily cleanup.`,
        confirmText: "Save",
        cancelText: "Cancel",
        variant: "danger",
      });
      if (!confirmed) return;
    }

    updateMutation.mutate({
      logRetentionDays: days,
      rawRetentionDays: rawDays,
      ...(needsAcknowledgement ? { acknowledgeStorageWarning: true } : {}),
    });
  };

  return (
    <Panel>
      <div className="p-6">
        <h3 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
          Data retention
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Older logs are deleted automatically every day.
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <label
            htmlFor="log-retention"
            className="text-sm font-medium text-gray-900 dark:text-white"
          >
            Keep logs for
          </label>
          <div className="relative w-full sm:w-60">
            <select
              id="log-retention"
              value={days}
              onChange={(event) => {
                setDays(Number(event.target.value));
                setAcknowledged(false);
              }}
              disabled={!canManage || busy}
              className="h-9 w-full cursor-pointer appearance-none rounded-lg border border-gray-200 bg-white pl-3 pr-10 text-[13px] font-medium text-gray-900 shadow-sm outline-none transition-colors hover:border-gray-300 focus:ring-2 focus:ring-blue-500/40 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-[#111113] dark:text-white dark:[color-scheme:dark] dark:hover:border-white/20"
            >
              {options.map((option) => (
                <option
                  key={option.days}
                  value={option.days}
                  className="bg-white text-gray-900 dark:bg-[#1c1c1e] dark:text-white"
                >
                  {option.note
                    ? `${option.label} (${option.note})`
                    : option.label}
                </option>
              ))}
            </select>
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 8l4 4 4-4"
              />
            </svg>
          </div>
        </div>

        {needsLargeDatabase ? (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-amber-500/30 bg-amber-50 px-4 py-3 dark:bg-amber-500/10"
          >
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
              Requires a larger database
            </p>
            <p className="mt-0.5 text-sm text-amber-800 dark:text-amber-200/80">
              {spec.vcpu} · {spec.ramGb} GB RAM
              {spec.diskGb !== null ? ` · ${spec.diskGb} GB free storage` : ""}
            </p>
            {needsAcknowledgement ? (
              <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-amber-900 dark:text-amber-100">
                <input
                  type="checkbox"
                  checked={acknowledged}
                  disabled={busy}
                  onChange={(event) => setAcknowledged(event.target.checked)}
                  className="h-4 w-4 accent-amber-600"
                />
                My database meets these requirements
              </label>
            ) : null}
          </div>
        ) : null}

        {!schedule.enabled ? (
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Automatic cleanup is turned off on the server.
          </p>
        ) : null}
        {!canManage ? (
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Only organization admins can change this.
          </p>
        ) : null}
      </div>

      {canManage ? (
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4 dark:border-white/[0.06]">
          {dirty ? (
            <Button
              variant="outline"
              size="md"
              onClick={handleCancel}
              disabled={busy}
              className="min-w-20"
            >
              Cancel
            </Button>
          ) : null}
          <Button
            variant="primary"
            size="md"
            onClick={handleSave}
            disabled={!canSave}
            className="min-w-24"
          >
            {busy ? "Saving…" : "Save"}
          </Button>
        </div>
      ) : null}
    </Panel>
  );
}
