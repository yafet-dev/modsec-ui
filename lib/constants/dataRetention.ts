/**
 * Options and database sizing guidance for the Data Retention settings tab.
 * The allowed range itself comes from the API so it cannot drift from what
 * the backend enforces.
 */

export interface RetentionPreset {
  days: number;
  label: string;
  note?: string;
}

export const LOG_RETENTION_PRESETS: RetentionPreset[] = [
  { days: 7, label: "7 days" },
  { days: 14, label: "14 days" },
  { days: 30, label: "1 month", note: "default" },
  { days: 60, label: "2 months" },
  { days: 90, label: "3 months", note: "recommended" },
  { days: 180, label: "6 months" },
  { days: 365, label: "1 year" },
];

export interface DatabaseSpec {
  label: string;
  vcpu: string;
  ramGb: number;
}

/**
 * Rough PostgreSQL sizing for a WAF log workload. The dashboard aggregates
 * over the retained window, so CPU and memory needs grow with both the number
 * of days kept and the size of the data.
 */
const SPEC_TIERS: Array<DatabaseSpec & { maxDays: number; maxGb: number }> = [
  { maxDays: 30, maxGb: 5, label: "Starter", vcpu: "2 shared vCPU", ramGb: 1 },
  { maxDays: 90, maxGb: 20, label: "Standard", vcpu: "2 vCPU", ramGb: 2 },
  { maxDays: 180, maxGb: 60, label: "Large", vcpu: "2 dedicated vCPU", ramGb: 4 },
  { maxDays: 365, maxGb: 150, label: "X-Large", vcpu: "4 dedicated vCPU", ramGb: 8 },
  { maxDays: Infinity, maxGb: Infinity, label: "2X-Large", vcpu: "8 dedicated vCPU", ramGb: 16 },
];

/** Free disk to keep on top of the data for indexes, vacuum, WAL and spikes. */
const DISK_HEADROOM = 1.5;

const GB = 1024 ** 3;

export interface StorageEstimate {
  logBytes: number;
  rawBytes: number;
  totalBytes: number;
}

export function estimateStorage(params: {
  dailyEvents: number;
  avgLogRowBytes: number;
  avgRawRowBytes: number;
  logDays: number;
  rawDays: number;
}): StorageEstimate | null {
  if (params.dailyEvents <= 0) return null;
  const logBytes = params.dailyEvents * params.logDays * params.avgLogRowBytes;
  const rawBytes = params.dailyEvents * params.rawDays * params.avgRawRowBytes;
  return { logBytes, rawBytes, totalBytes: logBytes + rawBytes };
}

export function recommendDatabaseSpec(
  logDays: number,
  estimate: StorageEstimate | null
): DatabaseSpec & { diskGb: number | null } {
  const gb = estimate ? estimate.totalBytes / GB : 0;
  const byDays = SPEC_TIERS.findIndex((tier) => logDays <= tier.maxDays);
  const bySize = SPEC_TIERS.findIndex((tier) => gb <= tier.maxGb);
  const { label, vcpu, ramGb } = SPEC_TIERS[Math.max(byDays, bySize)];
  return {
    label,
    vcpu,
    ramGb,
    diskGb: estimate ? Math.max(1, Math.ceil(gb * DISK_HEADROOM)) : null,
  };
}

/** Date before which data is removed when keeping `days` days. */
export function cutoffDate(days: number, now: Date = new Date()): Date {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}
