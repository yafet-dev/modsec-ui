"use client";

import { CARD_CLASS } from "@/components/dashboard/dashboardUi";

const BAR = "animate-pulse rounded bg-gray-100 dark:bg-white/[0.06]";

/** Placeholder for the WAF tab while the organization and domain status load. */
export function WAFSettingsSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <div className={`${CARD_CLASS} flex items-center justify-between p-5`}>
        <div>
          <div className={`${BAR} h-4 w-40`} />
          <div className={`${BAR} mt-2 h-3 w-28`} />
        </div>
        <div className={`${BAR} h-6 w-16`} />
      </div>

      <div className={`${CARD_CLASS} overflow-hidden`}>
        <div className="border-b border-gray-100 px-5 py-4 dark:border-white/[0.06]">
          <div className={`${BAR} h-4 w-32`} />
          <div className={`${BAR} mt-2 h-3 w-64`} />
        </div>
        <div className="divide-y divide-gray-100 dark:divide-white/[0.06]">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between px-5 py-4">
              <div>
                <div className={`${BAR} h-3.5 w-44`} />
                <div className={`${BAR} mt-2 h-3 w-56`} />
              </div>
              <div className={`${BAR} h-6 w-11 rounded-full`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
