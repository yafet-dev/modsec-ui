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

export function StatsCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton variant="circular" width={48} height={48} />
        <Skeleton variant="text" width={60} height={20} />
      </div>
      <Skeleton variant="text" width={120} height={16} className="mb-2" />
      <Skeleton variant="text" width={80} height={36} />
    </div>
  );
}

export function StatsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Skeleton variant="text" width={150} height={24} className="mb-2" />
          <Skeleton variant="text" width={200} height={16} />
        </div>
        <Skeleton variant="rectangular" width={300} height={40} />
      </div>
      <Skeleton variant="rectangular" width="100%" height={300} />
    </div>
  );
}

export function MapSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Skeleton variant="text" width={150} height={24} />
          <Skeleton variant="circular" width={40} height={20} />
        </div>
        <div className="flex items-center gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton variant="circular" width={8} height={8} />
              <Skeleton variant="text" width={30} height={16} />
              <Skeleton variant="text" width={50} height={14} />
            </div>
          ))}
        </div>
      </div>
      <Skeleton variant="rectangular" width="100%" height={400} />
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









