"use client";

export type TimeRange = "24h" | "7d" | "30d" | "3m";

interface TimeFilterProps {
  selected: TimeRange;
  onChange: (range: TimeRange) => void;
}

const timeRanges: { value: TimeRange; label: string; title: string }[] = [
  { value: "24h", label: "24h", title: "Last 24 hours" },
  { value: "7d", label: "7d", title: "Last 7 days" },
  { value: "30d", label: "30d", title: "Last 30 days" },
  { value: "3m", label: "3m", title: "Last 3 months" },
];

/** Lower-case phrase for subtitles, e.g. "last 7 days". */
export const RANGE_LABEL: Record<TimeRange, string> = {
  "24h": "last 24 hours",
  "7d": "last 7 days",
  "30d": "last 30 days",
  "3m": "last 3 months",
};

export function TimeFilter({ selected, onChange }: TimeFilterProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Time range"
      className="inline-flex w-full rounded-lg border border-gray-200 bg-gray-50 p-0.5 sm:w-auto dark:border-white/10 dark:bg-white/[0.04]"
    >
      {timeRanges.map((range) => {
        const active = selected === range.value;
        return (
          <button
            key={range.value}
            type="button"
            role="radio"
            aria-checked={active}
            title={range.title}
            onClick={() => onChange(range.value)}
            className={[
              "flex-1 cursor-pointer rounded-md px-3.5 py-1.5 text-[13px] font-medium transition-colors sm:flex-none",
              active
                ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200 dark:bg-white/10 dark:text-white dark:ring-white/10"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white",
            ].join(" ")}
          >
            {range.label}
          </button>
        );
      })}
    </div>
  );
}
