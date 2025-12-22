"use client";

import { type Rule } from "@/data/rules";
import { useRole } from "@/components/providers/RoleProvider";

interface RulesTableProps {
  rules: Rule[];
  onToggleRule: (ruleId: string) => void;
  onApproveRule?: (ruleId: string, approved: boolean) => void;
}

function SeverityBadge({ severity }: { severity: Rule["severity"] }) {
  const styles = {
    critical: "bg-red-500 text-white",
    high: "bg-orange-500 text-white",
    medium: "bg-yellow-500 text-gray-900",
    low: "bg-gray-400 dark:bg-gray-600 text-white",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${styles[severity]}`}
    >
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </span>
  );
}

function ApprovalStatusBadge({ status }: { status: Rule["approvalStatus"] }) {
  if (!status || status === "approved") return null;

  const styles = {
    pending:
      "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200",
    rejected: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}
    >
      {status === "pending" ? "Pending Approval" : "Rejected"}
    </span>
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
          ? "bg-blue-500 cursor-pointer"
          : "bg-gray-300 dark:bg-gray-700 cursor-pointer"
      }`}
      role="switch"
      aria-checked={enabled}
      aria-disabled={disabled}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export function RulesTable({
  rules,
  onToggleRule,
  onApproveRule,
}: RulesTableProps) {
  const { currentRole } = useRole();
  const canToggle = currentRole !== "viewer";
  const canApprove = currentRole === "super_admin" && onApproveRule;
  if (rules.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center">
        <svg
          className="w-12 h-12 text-gray-400 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No rules found
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                ID
              </th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Name
              </th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Severity
              </th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Source
              </th>
              <th className="text-right px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Hits
              </th>
              <th className="text-center px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              {canApprove && (
                <th className="text-center px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {rules.map((rule) => (
              <tr
                key={rule.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <td className="px-6 py-5">
                  <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
                    {rule.id}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {rule.name}
                      </p>
                      <ApprovalStatusBadge status={rule.approvalStatus} />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {rule.description}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <SeverityBadge severity={rule.severity} />
                </td>
                <td className="px-6 py-5">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {rule.source}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {rule.hits.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex justify-center">
                    <ToggleSwitch
                      enabled={rule.enabled}
                      onToggle={() => onToggleRule(rule.id)}
                      disabled={!canToggle}
                    />
                  </div>
                </td>
                {canApprove && (
                  <td className="px-6 py-5">
                    {rule.approvalStatus === "pending" && (
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => onApproveRule(rule.id, true)}
                          className="px-3 py-1.5 text-xs font-medium text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                          title="Approve rule"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => onApproveRule(rule.id, false)}
                          className="px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                          title="Reject rule"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {rule.approvalStatus === "rejected" && (
                      <div className="flex justify-center">
                        <button
                          onClick={() => onApproveRule(rule.id, true)}
                          className="px-3 py-1.5 text-xs font-medium text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                          title="Approve rule"
                        >
                          Approve
                        </button>
                      </div>
                    )}
                    {(!rule.approvalStatus ||
                      rule.approvalStatus === "approved") && (
                      <span className="text-xs text-gray-400 dark:text-gray-500 text-center block">
                        Approved
                      </span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
