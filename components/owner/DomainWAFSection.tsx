"use client";

import { useState } from "react";
import { useDomainWafStatus, useToggleDomainWaf } from "@/lib/api/hooks/useDomainWaf";

interface DomainWAFSectionProps {
  organizationId: string;
  domains: string[];
}

export function DomainWAFSection({
  organizationId,
  domains,
}: DomainWAFSectionProps) {
  const { data: wafStatus, isLoading, error } = useDomainWafStatus(
    organizationId
  );
  const toggleMutation = useToggleDomainWaf();

  // Create a map of domain -> wafEnabled
  const getWafStatus = (domain: string): boolean => {
    if (!wafStatus) return true; // Default to enabled
    const status = wafStatus.domains.find((d) => d.domain === domain);
    return status?.wafEnabled ?? true;
  };

  const handleToggle = (domain: string, currentStatus: boolean) => {
    toggleMutation.mutate({
      organizationId,
      domain,
      enabled: !currentStatus,
    });
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-sm text-red-600 dark:text-red-400">
          Failed to load WAF status. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          WAF Protection
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Enable or disable Web Application Firewall protection for each domain
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading WAF status...
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {domains.map((domain) => {
            const wafEnabled = getWafStatus(domain);
            const isToggling =
              toggleMutation.isPending &&
              toggleMutation.variables?.domain === domain;

            return (
              <div
                key={domain}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
                    {domain}
                  </span>
                  <WAFStatusBadge enabled={wafEnabled} />
                </div>

                <div className="flex items-center gap-3">
                  <ToggleSwitch
                    enabled={wafEnabled}
                    onToggle={() => handleToggle(domain, wafEnabled)}
                    disabled={isToggling}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ToggleSwitch({
  enabled,
  onToggle,
  disabled = false,
}: {
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
        disabled
          ? "bg-gray-200 dark:bg-gray-700 cursor-not-allowed opacity-50"
          : enabled
          ? "bg-green-500"
          : "bg-gray-300 dark:bg-gray-700"
      }`}
      aria-label={enabled ? "Disable WAF" : "Enable WAF"}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function WAFStatusBadge({ enabled }: { enabled: boolean }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
        enabled
          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
          : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
      }`}
    >
      {enabled ? "✓ Enabled" : "✗ Disabled"}
    </span>
  );
}

