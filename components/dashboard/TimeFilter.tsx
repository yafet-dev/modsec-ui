"use client";

export type TimeRange = "24h" | "7d" | "30d" | "3m";

interface TimeFilterProps {
  selected: TimeRange;
  onChange: (range: TimeRange) => void;
}

const timeRanges: { value: TimeRange; label: string }[] = [
  { value: "24h", label: "24 Hours" },
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "3m", label: "3 Months" },
];

export function TimeFilter({ selected, onChange }: TimeFilterProps) {
  return (
    <div className="flex flex-wrap gap-1.5 sm:gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-full sm:w-auto">
      {timeRanges.map((range) => (
        <button
          key={range.value}
          onClick={() => onChange(range.value)}
          className={`
            flex-1 min-w-[4.5rem] sm:flex-initial sm:min-w-0 px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200
            ${
              selected === range.value
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }
          `}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}
