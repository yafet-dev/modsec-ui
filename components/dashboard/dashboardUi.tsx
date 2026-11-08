"use client";

import { ReactNode, forwardRef, useId } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";

/**
 * Shared building blocks for the dashboard: card chrome, chart colors and the
 * status palette. Colors follow the validated data-viz palette:
 *   - series identity: blocked = blue, allowed = orange (checked for CVD
 *     separation and contrast against both card surfaces)
 *   - status (threat level, severity): good / warning / serious / critical,
 *     always shown with a text label, never color alone.
 */

export const CARD_CLASS =
  "rounded-2xl border border-gray-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] dark:border-white/[0.08] dark:bg-[#111113] dark:shadow-none";

export function Card({
  className = "",
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return <div className={`${CARD_CLASS} ${className}`}>{children}</div>;
}

export function CardHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.06]">
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold tracking-tight text-gray-900 dark:text-white">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-0.5 text-[13px] text-gray-500 dark:text-gray-400">{subtitle}</p>
        ) : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

/** Page title block shared by Dashboard, Logs, Users and Settings. */
export function PageHeader({
  title,
  description,
  live = false,
  eyebrow,
  actions,
}: {
  title: string;
  description?: ReactNode;
  /** Show the "Live" indicator above the title. */
  live?: boolean;
  /** Small text above the title when not live. */
  eyebrow?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1">
        {live ? (
          <div className="flex items-center gap-2 text-[12px] font-medium text-gray-500 dark:text-gray-400">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Live · refreshes every 30 seconds
          </div>
        ) : eyebrow ? (
          <div className="text-[12px] font-medium text-gray-500 dark:text-gray-400">{eyebrow}</div>
        ) : null}
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl dark:text-white">
          {title}
        </h1>
        {description ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}

/** Compact number tile used on Logs and Users. */
export function MiniStat({
  label,
  value,
  sub,
  accent,
  children,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  accent?: string;
  children?: ReactNode;
}) {
  return (
    <Card className="min-w-0 px-5 py-4">
      <div className="flex items-center gap-2 text-[13px] font-medium text-gray-500 dark:text-gray-400">
        {accent ? (
          <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: accent }} aria-hidden="true" />
        ) : null}
        {label}
      </div>
      <div className="mt-2 truncate text-[22px] font-semibold leading-tight tracking-tight text-gray-900 dark:text-white">
        {value}
      </div>
      <div className="mt-1 min-h-[18px] truncate text-[12px] text-gray-500 dark:text-gray-400">
        {sub}
      </div>
      {children}
    </Card>
  );
}

/** Small primary and secondary buttons in the dashboard style. */
export const BUTTON_PRIMARY =
  "inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-gray-900 px-3.5 text-[13px] font-medium text-white shadow-sm transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200";
export const BUTTON_SECONDARY =
  "inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 text-[13px] font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-gray-200 dark:hover:bg-white/[0.08]";
export const BUTTON_GHOST =
  "inline-flex h-8 cursor-pointer items-center justify-center rounded-lg px-2.5 text-[12px] font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-300 dark:hover:bg-white/[0.06] dark:hover:text-white";
export const INPUT_CLASS =
  "h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-[13px] text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-white/10 dark:bg-[#111113] dark:text-gray-100 dark:placeholder:text-gray-500 dark:hover:border-white/20";

const DASH_BUTTON_BASE =
  "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg font-medium shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50";
const DASH_BUTTON_VARIANT = {
  primary:
    "bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200",
  secondary:
    "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-gray-200 dark:hover:bg-white/[0.08]",
  outline:
    "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-gray-200 dark:hover:bg-white/[0.08]",
} as const;
const DASH_BUTTON_SIZE = {
  sm: "h-8 px-3 text-[12px]",
  md: "h-9 px-3.5 text-[13px]",
  lg: "h-10 px-4 text-[14px]",
} as const;

/**
 * Same props as components/ui/Button, drawn in the dashboard style. Pages
 * moved to the dashboard look import this in place of Button.
 */
export function DashButton({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof DASH_BUTTON_VARIANT;
  size?: keyof typeof DASH_BUTTON_SIZE;
  children: ReactNode;
}) {
  return (
    <button
      className={`${DASH_BUTTON_BASE} ${DASH_BUTTON_VARIANT[variant]} ${DASH_BUTTON_SIZE[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

/** Same props as components/ui/Input, drawn in the dashboard style. */
export const DashInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }
>(function DashInput({ label, error, className = "", id, ...props }, ref) {
  return (
    <div className="w-full">
      {label ? (
        <label
          htmlFor={id}
          className="mb-1.5 block text-[13px] font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
      ) : null}
      <input
        ref={ref}
        id={id}
        aria-invalid={error ? true : undefined}
        className={`${INPUT_CLASS} ${error ? "border-red-400 dark:border-red-500/70" : ""} ${className}`}
        {...props}
      />
      {error ? <p className="mt-1.5 text-[12px] text-red-600 dark:text-red-400">{error}</p> : null}
    </div>
  );
});

export interface ChartColors {
  blocked: string;
  allowed: string;
  neutral: string;
  surface: string;
  grid: string;
  baseline: string;
  muted: string;
}

const LIGHT: ChartColors = {
  blocked: "#2a78d6",
  allowed: "#eb6834",
  neutral: "#898781",
  surface: "#ffffff",
  grid: "#ecebe6",
  baseline: "#c3c2b7",
  muted: "#898781",
};

const DARK: ChartColors = {
  blocked: "#3987e5",
  allowed: "#d95926",
  neutral: "#898781",
  surface: "#111113",
  grid: "#232325",
  baseline: "#38383a",
  muted: "#8b8b90",
};

export function useChartColors(): ChartColors {
  const { theme } = useTheme();
  return theme === "dark" ? DARK : LIGHT;
}

/** Fixed status palette: never reused for series identity. */
export const STATUS_COLOR = {
  good: "#0ca30c",
  warning: "#fab219",
  serious: "#ec835a",
  critical: "#d03b3b",
} as const;

export type ThreatLevel = "Low" | "Medium" | "High" | "Critical";

export const THREAT_LEVELS: ThreatLevel[] = ["Low", "Medium", "High", "Critical"];

export const THREAT_COLOR: Record<ThreatLevel, string> = {
  Low: STATUS_COLOR.good,
  Medium: STATUS_COLOR.warning,
  High: STATUS_COLOR.serious,
  Critical: STATUS_COLOR.critical,
};

export const SEVERITY_COLOR: Record<string, string> = {
  critical: STATUS_COLOR.critical,
  high: STATUS_COLOR.serious,
  medium: STATUS_COLOR.warning,
  low: "#898781",
};

/** Small severity label: colored dot plus text, so color never stands alone. */
export function SeverityBadge({ severity }: { severity: string }) {
  const key = (severity || "low").toLowerCase();
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[11px] font-medium capitalize text-gray-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-gray-300">
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: SEVERITY_COLOR[key] ?? SEVERITY_COLOR.low }}
        aria-hidden="true"
      />
      {key}
    </span>
  );
}

/** WAF action: "blocked" or "warning" (detected, allowed through). */
export function ActionBadge({ action }: { action: string }) {
  const blocked = action === "blocked";
  return (
    <span
      className={[
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium",
        blocked
          ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
          : "border border-gray-200 text-gray-600 dark:border-white/10 dark:text-gray-300",
      ].join(" ")}
    >
      {blocked ? "Blocked" : "Allowed"}
    </span>
  );
}

/** Tiny trend line for stat tiles. Decorative: the tile shows the value. */
export function Sparkline({
  values,
  color,
  className = "",
}: {
  values: number[];
  color: string;
  className?: string;
}) {
  const gradientId = useId();
  if (values.length < 2) return <div className={className} />;

  const width = 120;
  const height = 32;
  const pad = 2;
  const max = Math.max(...values, 1);
  const step = width / (values.length - 1);
  const points = values.map((value, index) => [
    index * step,
    height - pad - (value / max) * (height - pad * 2),
  ]);
  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.18} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function formatCompact(value: number): string {
  return new Intl.NumberFormat(undefined, {
    notation: value >= 10_000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}
