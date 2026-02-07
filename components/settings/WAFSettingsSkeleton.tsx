"use client";

export function WAFSettingsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Organization Info Card Skeleton */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 animate-pulse">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="h-6 w-48 bg-gray-300 dark:bg-gray-700 rounded-lg mb-2"></div>
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
          </div>
          <div className="h-7 w-20 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>

      {/* WAF Protection Section Skeleton */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
        {/* Section Header Skeleton */}
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-300 dark:bg-gray-700 animate-pulse"></div>
            <div className="flex-1">
              <div className="h-5 w-32 bg-gray-300 dark:bg-gray-700 rounded-lg mb-2 animate-pulse"></div>
              <div className="h-4 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Domains List Skeleton */}
        <div className="p-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 animate-pulse"
            >
              <div className="flex items-center gap-4 flex-1">
                {/* Domain Icon Skeleton */}
                <div className="w-10 h-10 rounded-lg bg-gray-300 dark:bg-gray-700"></div>

                {/* Domain Info Skeleton */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-4 w-40 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
                    <div className="h-5 w-20 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                  </div>
                  <div className="h-3 w-56 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
                </div>
              </div>

              {/* Toggle Switch Skeleton */}
              <div className="h-7 w-12 rounded-full bg-gray-300 dark:bg-gray-700"></div>
            </div>
          ))}
        </div>

        {/* Footer Skeleton */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="h-3 w-full bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
              <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

