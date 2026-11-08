"use client";

interface SkeletonProps {
  className?: string;
  variant?: "default" | "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
}

export function Skeleton({
  className = "",
  variant = "rectangular",
  width,
  height,
  animation = "pulse",
}: SkeletonProps) {
  const baseClasses = "bg-gray-200 dark:bg-gray-800";
  
  const variantClasses = {
    default: "rounded",
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded",
  };

  const animationClasses = {
    pulse: "animate-pulse",
    wave: "animate-pulse",
    none: "",
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === "number" ? `${width}px` : width;
  if (height) style.height = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  );
}

// Pre-built skeleton components for common use cases

// Matches the dashboard card chrome in components/dashboard/dashboardUi.tsx.
const DASHBOARD_CARD =
  "rounded-2xl border border-gray-200/80 bg-white dark:border-white/[0.08] dark:bg-[#111113]";

export function StatsCardSkeleton() {
  return (
    <div className={`${DASHBOARD_CARD} p-5`}>
      <Skeleton variant="text" width={96} height={14} />
      <Skeleton variant="text" width={110} height={28} className="mt-3" />
      <Skeleton variant="text" width={140} height={12} className="mt-2.5" />
      <Skeleton variant="rectangular" width="100%" height={32} className="mt-4" />
    </div>
  );
}

export function StatsGridSkeleton() {
  // Four tiles, matching StatsGrid: events, blocked, allowed, threat level.
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className={DASHBOARD_CARD}>
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/[0.06]">
        <div>
          <Skeleton variant="text" width={120} height={16} className="mb-2" />
          <Skeleton variant="text" width={220} height={12} />
        </div>
        <Skeleton variant="rectangular" width={180} height={20} />
      </div>
      <div className="p-5">
        <Skeleton variant="rectangular" width="100%" height={290} />
      </div>
    </div>
  );
}

export function MapSkeleton() {
  return (
    <div className={DASHBOARD_CARD}>
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/[0.06]">
        <div>
          <Skeleton variant="text" width={120} height={16} className="mb-2" />
          <Skeleton variant="text" width={240} height={12} />
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} variant="rectangular" width={80} height={28} className="rounded-lg" />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-4 p-5 lg:flex-row">
        <Skeleton variant="rectangular" width="100%" height={380} className="flex-1 rounded-xl" />
        <div className="space-y-2 lg:w-72">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} variant="rectangular" width="100%" height={40} className="rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function RecentActivitySkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
      <div className="divide-y divide-gray-200 dark:divide-gray-800">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton variant="circular" width={8} height={8} />
                <div>
                  <Skeleton variant="text" width={300} height={20} className="mb-2" />
                  <Skeleton variant="text" width={150} height={16} />
                </div>
              </div>
              <Skeleton variant="text" width={80} height={16} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex gap-4">
          {[...Array(columns)].map((_, i) => (
            <Skeleton key={i} variant="text" width={120} height={20} />
          ))}
        </div>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-800">
        {[...Array(rows)].map((_, rowIndex) => (
          <div key={rowIndex} className="p-4">
            <div className="flex gap-4">
              {[...Array(columns)].map((_, colIndex) => (
                <Skeleton key={colIndex} variant="text" width={120} height={16} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}









