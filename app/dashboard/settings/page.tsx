"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRole } from "@/components/providers/RoleProvider";
import { LayoutWrapper } from "@/components/ui/LayoutWrapper";
import { Section } from "@/components/ui/Section";
import {
  DashButton as Button,
  DashInput as Input,
  PageHeader,
} from "@/components/dashboard/dashboardUi";
import {
  useMyOrganizations,
  useSendSummaryReportNow,
  useUpdateSummaryReport,
} from "@/lib/api/hooks/useOrganization";
import { useDomainWafStatus, useToggleDomainWaf } from "@/lib/api/hooks/useDomainWaf";
import { WAFSettingsSkeleton } from "@/components/settings/WAFSettingsSkeleton";
import { IPBanList } from "@/components/settings/IPBanList";
import { GeoLocationAccess } from "@/components/settings/GeoLocationAccess";
import { NotificationsSettings } from "@/components/settings/NotificationsSettings";
import { DataRetentionSettings } from "@/components/settings/DataRetentionSettings";

type TabKey = "waf" | "ip-ban" | "geo-location" | "notifications" | "data-retention";

const tabs = [
  { key: "waf" as const, label: "WAF" },
  { key: "ip-ban" as const, label: "IP Ban List" },
  { key: "geo-location" as const, label: "Geo Access" },
  { key: "notifications" as const, label: "Notifications" },
  { key: "data-retention" as const, label: "Data Retention" },
];

interface SavedSummarySettings {
  enabled: boolean;
  frequency: string;
  emails: string[];
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("waf");
  const [summaryFrequency, setSummaryFrequency] = useState("daily");
  const [summaryEnabled, setSummaryEnabled] = useState(true);
  const [summaryEmails, setSummaryEmails] = useState<string[]>([]);
  const [newSummaryEmail, setNewSummaryEmail] = useState("");
  const [isSummaryEditMode, setIsSummaryEditMode] = useState(false);

  const { isAuthenticated, isAuthLoading } = useAuth();
  const { currentRole } = useRole();
  const updateSummaryReport = useUpdateSummaryReport();
  const sendReportNow = useSendSummaryReportNow();
  const router = useRouter();

  const { data: myOrganizations, isLoading: orgsLoading } = useMyOrganizations();

  const organization = myOrganizations?.[0];
  const { data: wafStatus, isLoading: wafLoading } = useDomainWafStatus(organization?.id || null);
  const toggleMutation = useToggleDomainWaf();

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isAuthenticated) {
      router.push("/");
    } else if (currentRole === "super_admin") {
      router.push("/owner/dashboard");
    }
  }, [isAuthLoading, isAuthenticated, currentRole, router]);

  if (isAuthLoading || !isAuthenticated || currentRole === "super_admin") return null;

  const isLoading = orgsLoading || wafLoading;
  const hasOrganization = !!organization;
  const domains = organization?.domains || [];
  const canManageSummary = currentRole !== "viewer";

  const hasSummaryRecipients =
    (organization?.summaryReportEmails?.length ?? 0) > 0;

  const getWafStatus = (domain: string): boolean => {
    if (!wafStatus) return true;
    const status = wafStatus.domains.find((d) => d.domain === domain);
    return status?.wafEnabled ?? true;
  };

  const handleToggle = (domain: string, currentStatus: boolean) => {
    if (!organization) return;

    toggleMutation.mutate({
      organizationId: organization.id,
      domain,
      enabled: !currentStatus,
    });
  };

  const handleAddSummaryEmail = () => {
    const value = newSummaryEmail.trim();
    if (!value) {
      toast.error("Please enter an email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (summaryEmails.includes(value)) {
      toast.error("This email is already in the list");
      return;
    }

    setSummaryEmails((prev) => [...prev, value]);
    setNewSummaryEmail("");
    toast.success("Email added successfully");
  };

  const handleRemoveSummaryEmail = (email: string) => {
    setSummaryEmails((prev) => prev.filter((e) => e !== email));
    toast.success("Email removed");
  };

  const handleEditSummarySettings = () => {
    if (organization) {
      setSummaryEnabled(organization.summaryReportEnabled ?? false);
      setSummaryFrequency(organization.summaryReportFrequency ?? "daily");
      setSummaryEmails([...(organization.summaryReportEmails ?? [])]);
    }
    setIsSummaryEditMode(true);
  };

  const handleCancelSummaryEdit = () => {
    setIsSummaryEditMode(false);
    if (organization) {
      setSummaryEnabled(organization.summaryReportEnabled ?? false);
      setSummaryFrequency(organization.summaryReportFrequency ?? "daily");
      setSummaryEmails([...(organization.summaryReportEmails ?? [])]);
    }
  };

  const handleSaveSummarySettings = () => {
    if (!organization) return;
    if (summaryEnabled && summaryEmails.length === 0) {
      toast.error("Please add at least one email address to receive reports");
      return;
    }

    updateSummaryReport.mutate(
      {
        organizationId: organization.id,
        data: {
          enabled: summaryEnabled,
          frequency: summaryFrequency as "hourly" | "daily" | "weekly" | "monthly",
          emails: summaryEmails,
        },
      },
      {
        onSuccess: () => {
          setIsSummaryEditMode(false);
        },
      }
    );
  };

  const handleRemoveSummarySettings = () => {
    if (!organization) return;
    updateSummaryReport.mutate(
      {
        organizationId: organization.id,
        data: {
          enabled: false,
          emails: [],
        },
      },
      {
        onSuccess: () => {
          setIsSummaryEditMode(false);
        },
      }
    );
  };

  const handleSendReportNow = () => {
    if (!organization) return;
    const emails = isSummaryEditMode
      ? summaryEmails
      : [...(organization.summaryReportEmails ?? [])];
    if (emails.length === 0) {
      toast.error("Add at least one recipient email first");
      return;
    }
    if (domains.length === 0) {
      toast.error("Configure at least one domain for your organization first");
      return;
    }
    sendReportNow.mutate({ organizationId: organization.id, emails });
  };

  const canSendReportNow =
    canManageSummary &&
    domains.length > 0 &&
    (isSummaryEditMode ? summaryEmails.length > 0 : hasSummaryRecipients);

  return (
    <LayoutWrapper>
      <main className="py-6 sm:py-8">
        <Section>
          <div>
            <PageHeader
              eyebrow="Configuration"
              title="Settings"
              description={
                organization?.name ? (
                  <>
                    Protection, access control, alerts and data retention for{" "}
                    <span className="font-medium text-gray-700 dark:text-gray-200">
                      {organization.name}
                    </span>
                  </>
                ) : (
                  "Protection, access control, alerts and data retention"
                )
              }
            />

            <div className="mb-6 mt-6">
              <SettingsTabs tabs={tabs} value={activeTab} onChange={setActiveTab} />
            </div>

            {/* Content */}
            {activeTab === "waf" ? (
              <>
                {isLoading ? (
                  <WAFSettingsSkeleton />
                ) : !hasOrganization ? (
                  <GlassCard className="p-10 text-center">
                    <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-black/5 dark:bg-white/10">
                      <svg
                        className="h-6 w-6 text-gray-500 dark:text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      No organization found
                    </h2>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      You need to be a member of an organization to manage WAF settings.
                    </p>
                  </GlassCard>
                ) : (
                  <div className="space-y-6">
                    {/* Org card */}
                    <GlassCard className="p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
                            {organization.name}
                          </h2>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Organization ID: {organization.id.slice(0, 8)}…
                          </p>
                        </div>

                        <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50/70 px-3 py-1 text-xs font-medium text-gray-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-300">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              organization.status === "active"
                                ? "bg-emerald-500"
                                : "bg-black/30 dark:bg-white/30"
                            }`}
                          />
                          {organization.status === "active" ? "Active" : organization.status}
                        </div>
                      </div>
                    </GlassCard>

                    {/* WAF section */}
                    <GlassCard className="overflow-hidden">
                      <div className="px-6 py-6">
                        <h3 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
                          WAF Protection
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          Enable or disable protection for each domain.
                        </p>
                      </div>

                      <div className="border-t border-gray-200/80 dark:border-white/10">
                        {domains.length === 0 ? (
                          <div className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                            No domains configured for this organization.
                          </div>
                        ) : (
                          <div className="divide-y divide-black/5 dark:divide-white/10">
                            {domains.map((domain) => {
                              const wafEnabled = getWafStatus(domain);
                              const isToggling =
                                toggleMutation.isPending &&
                                toggleMutation.variables?.domain === domain;

                              return (
                                <div
                                  key={domain}
                                  className="relative flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                                >
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-3">
                                      <p className="truncate font-mono text-sm font-medium text-gray-900 dark:text-white">
                                        {domain}
                                      </p>
                                      <AppleStatusPill enabled={wafEnabled} />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                      {wafEnabled
                                        ? "Protected by Web Application Firewall"
                                        : "WAF protection is disabled"}
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <AppleSwitch
                                      enabled={wafEnabled}
                                      onToggle={() => handleToggle(domain, wafEnabled)}
                                      disabled={isToggling}
                                    />
                                  </div>

                                  {isToggling && (
                                    <div className="absolute inset-0 grid place-items-center bg-white/40 dark:bg-black/30">
                                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-black/60 dark:border-white/20 dark:border-t-white/70" />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {domains.length > 0 && (
                        <div className="border-t border-gray-200/80 px-6 py-4 text-xs text-gray-500 dark:border-white/10 dark:text-gray-400">
                          When enabled, the WAF helps block common threats like SQL injection,
                          XSS, and malicious traffic patterns.
                        </div>
                      )}
                    </GlassCard>

                    {/* Summary reports — one HTML email per domain on each schedule */}
                    {!isSummaryEditMode && hasSummaryRecipients ? (
                      <SummaryReportsSummary
                        settings={{
                          enabled: organization?.summaryReportEnabled ?? false,
                          frequency: organization?.summaryReportFrequency ?? "daily",
                          emails: [...(organization?.summaryReportEmails ?? [])],
                        }}
                        onEdit={handleEditSummarySettings}
                        onRemove={handleRemoveSummarySettings}
                        canManage={canManageSummary}
                        onSendNow={handleSendReportNow}
                        canSendNow={canSendReportNow}
                        sendPending={sendReportNow.isPending}
                      />
                    ) : !isSummaryEditMode && !hasSummaryRecipients ? (
                      <GlassCard className="p-6">
                        <div className="text-center py-8">
                          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-black/5 dark:bg-white/10">
                            <svg
                              className="h-6 w-6 text-gray-500 dark:text-gray-400"
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
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            No Summary Reports Configured
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 max-w-md mx-auto">
                            Receive Zergaw Cloud WAF reports by email (same layout as the security
                            digest): one message per domain, on your chosen schedule.
                          </p>
                          {canManageSummary ? (
                            <Button onClick={() => setIsSummaryEditMode(true)} variant="primary" size="md">
                              Configure Summary Reports
                            </Button>
                          ) : (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Ask an organization admin to configure summary reports.
                            </p>
                          )}
                        </div>
                      </GlassCard>
                    ) : (
                      <GlassCard className="p-6">
                        <div className="flex items-start justify-between gap-6">
                          <div>
                            <h3 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
                              Summary Reports
                            </h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                              Recipients get one email per protected domain for each period (daily /
                              weekly / monthly / hourly), with stats and recent events. Uses your
                              Zergaw branding logo.
                            </p>
                          </div>

                          <AppleSwitch
                            enabled={summaryEnabled}
                            onToggle={() => setSummaryEnabled((v) => !v)}
                            disabled={!canManageSummary || updateSummaryReport.isPending}
                          />
                        </div>

                        {summaryEnabled && (
                          <div className="mt-6 space-y-6 border-t border-gray-200/80 pt-6 dark:border-white/10">
                            {/* Email Addresses */}
                            <div>
                              <label className="block text-xs font-medium tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                                Email Addresses
                              </label>
                              <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                                Add email addresses to receive summary reports.
                              </p>

                              <div className="flex gap-2 items-stretch">
                                <Input
                                  type="email"
                                  placeholder="Enter email address…"
                                  value={newSummaryEmail}
                                  onChange={(e) => setNewSummaryEmail(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      handleAddSummaryEmail();
                                    }
                                  }}
                                  className="flex-1"
                                  disabled={!canManageSummary || updateSummaryReport.isPending}
                                />
                                <Button
                                  onClick={handleAddSummaryEmail}
                                  variant="primary"
                                  size="md"
                                  className="px-6"
                                  disabled={!canManageSummary || updateSummaryReport.isPending}
                                >
                                  Add
                                </Button>
                              </div>

                              {summaryEmails.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {summaryEmails.map((email) => (
                                    <SummaryEmailTag
                                      key={email}
                                      email={email}
                                      onRemove={() => handleRemoveSummaryEmail(email)}
                                      removable={canManageSummary && !updateSummaryReport.isPending}
                                    />
                                  ))}
                                </div>
                              )}

                              {summaryEmails.length === 0 && (
                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic">
                                  No email addresses added yet. Add at least one to receive reports.
                                </p>
                              )}
                            </div>

                            {/* Frequency */}
                            <div>
                              <label className="block text-xs font-medium tracking-wide text-gray-500 dark:text-gray-400">
                                Frequency
                              </label>

                              <div className="mt-2">
                                <select
                                  value={summaryFrequency}
                                  onChange={(e) => setSummaryFrequency(e.target.value)}
                                  disabled={!canManageSummary || updateSummaryReport.isPending}
                                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-black/20 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:focus:border-white/20 dark:focus:ring-white/10 disabled:opacity-50"
                                >
                                  <option value="hourly">Hourly</option>
                                  <option value="daily">Daily</option>
                                  <option value="weekly">Weekly</option>
                                  <option value="monthly">Monthly</option>
                                </select>

                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                  {summaryFrequency === "hourly" &&
                                    "You will receive a summary every hour with the latest WAF activity."}
                                  {summaryFrequency === "daily" &&
                                    "You will receive a daily summary at the end of each day with all WAF activity."}
                                  {summaryFrequency === "weekly" &&
                                    "You will receive a weekly summary every Monday with the week's WAF activity."}
                                  {summaryFrequency === "monthly" &&
                                    "You will receive a monthly summary on the first day of each month."}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Save/Cancel / Send now */}
                        <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-gray-200/80 pt-6 dark:border-white/10">
                          <Button
                            type="button"
                            onClick={handleSendReportNow}
                            variant="outline"
                            size="md"
                            disabled={
                              !canSendReportNow ||
                              sendReportNow.isPending ||
                              updateSummaryReport.isPending
                            }
                            title="Sends one email per domain with WAF stats for the last 7 days (does not change your schedule)"
                          >
                            {sendReportNow.isPending ? "Sending…" : "Send 7-day report now"}
                          </Button>
                          <Button
                            onClick={handleCancelSummaryEdit}
                            variant="outline"
                            size="md"
                            disabled={updateSummaryReport.isPending || sendReportNow.isPending}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSaveSummarySettings}
                            variant="primary"
                            size="md"
                            disabled={!canManageSummary || updateSummaryReport.isPending || sendReportNow.isPending}
                          >
                            {updateSummaryReport.isPending ? "Saving…" : "Save Settings"}
                          </Button>
                        </div>
                      </GlassCard>
                    )}
                  </div>
                )}
              </>
            ) : activeTab === "ip-ban" ? (
              <IPBanList domains={domains} organizationId={organization?.id || null} />
            ) : activeTab === "geo-location" ? (
              <GeoLocationAccess 
                domains={domains} 
                organizationId={organization?.id || null}
              />
            ) : activeTab === "notifications" ? (
              <NotificationsSettings domains={domains} organizationId={organization?.id || null} />
            ) : orgsLoading ? (
              <WAFSettingsSkeleton />
            ) : (
              <DataRetentionSettings organizationId={organization?.id || null} />
            )}
          </div>
        </Section>
      </main>
    </LayoutWrapper>
  );
}

/** Apple-style “glass” card */
function GlassCard({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={[
        "rounded-2xl border border-gray-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]",
        "dark:border-white/[0.08] dark:bg-[#111113] dark:shadow-none",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

/** Underline tab bar; scrolls sideways on narrow screens instead of wrapping. */
function SettingsTabs({
  tabs,
  value,
  onChange,
}: {
  tabs: { key: TabKey; label: string }[];
  value: TabKey;
  onChange: (v: TabKey) => void;
}) {
  return (
    <div className="-mx-4 overflow-x-auto border-b border-gray-200/80 px-4 sm:mx-0 sm:px-0 dark:border-white/[0.08]">
      <nav className="flex min-w-max gap-6" role="tablist" aria-label="Settings sections">
        {tabs.map((t) => {
          const active = t.key === value;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(t.key)}
              className={[
                "-mb-px cursor-pointer whitespace-nowrap border-b-2 py-3 text-[14px] font-medium transition-colors",
                active
                  ? "border-gray-900 text-gray-900 dark:border-white dark:text-white"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-900 dark:text-gray-400 dark:hover:border-white/30 dark:hover:text-white",
              ].join(" ")}
            >
              {t.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

/** WAF state label: dot plus text, matching the dashboard badges. */
function AppleStatusPill({ enabled }: { enabled: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-1.5 py-0.5 text-[11px] font-medium text-gray-700 dark:border-white/10 dark:text-gray-300">
      <span
        className={[
          "h-1.5 w-1.5 rounded-full",
          enabled ? "bg-emerald-500" : "bg-gray-400",
        ].join(" ")}
        aria-hidden="true"
      />
      {enabled ? "Protected" : "Disabled"}
    </span>
  );
}

/** Toggle switch */
function AppleSwitch({
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
      type="button"
      onClick={onToggle}
      disabled={disabled}
      role="switch"
      aria-checked={enabled}
      className={[
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
        "outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        enabled
          ? "bg-emerald-500"
          : "bg-gray-200 dark:bg-white/15",
      ].join(" ")}
      aria-label={enabled ? "Disable" : "Enable"}
    >
      <span
        className={[
          "absolute left-0.5 inline-block h-5 w-5 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.2)] transition-transform",
          enabled ? "translate-x-5" : "translate-x-0",
          "dark:bg-white",
        ].join(" ")}
      />
    </button>
  );
}

/** Summary view for saved summary report settings */
function SummaryReportsSummary({
  settings,
  onEdit,
  onRemove,
  canManage = true,
  onSendNow,
  canSendNow = false,
  sendPending = false,
}: {
  settings: SavedSummarySettings;
  onEdit: () => void;
  onRemove: () => void;
  canManage?: boolean;
  onSendNow?: () => void;
  canSendNow?: boolean;
  sendPending?: boolean;
}) {
  const getFrequencyText = () => {
    const frequencyMap: Record<string, string> = {
      hourly: "Hourly",
      daily: "Daily",
      weekly: "Weekly",
      monthly: "Monthly",
    };
    return frequencyMap[settings.frequency] || settings.frequency;
  };

  if (!settings.enabled) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-4 flex-1">
            <div className="h-10 w-10 rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/[0.03] flex items-center justify-center text-gray-500 dark:text-gray-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
                Summary Reports
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Summary reports are currently disabled.
              </p>
            </div>
          </div>
          {canManage && (
            <div className="flex flex-wrap items-center justify-end gap-2">
              {onSendNow && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onSendNow}
                  disabled={!canSendNow || sendPending}
                  title="One email per domain, last 7 days of WAF data"
                >
                  {sendPending ? "Sending…" : "Send 7-day report now"}
                </Button>
              )}
              <Button onClick={onEdit} variant="outline" size="sm">
                Edit
              </Button>
              <Button
                onClick={onRemove}
                variant="outline"
                size="sm"
                className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300"
              >
                Remove
              </Button>
            </div>
          )}
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-start gap-4 flex-1">
          <div className="h-10 w-10 rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/[0.03] flex items-center justify-center text-gray-900 dark:text-white">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
              Summary Reports
            </h3>
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-medium">Frequency:</span>
                <span>{getFrequencyText()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-medium">Recipients:</span>
                <span>
                  {settings.emails.length > 0
                    ? `${settings.emails.length} email${settings.emails.length > 1 ? "s" : ""}`
                    : "No emails configured"}
                </span>
              </div>
              {settings.emails.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {settings.emails.map((email) => (
                    <span
                      key={email}
                      className="inline-flex items-center rounded-full border border-gray-200 bg-white dark:border-white/10 dark:bg-white/[0.03] px-3 py-1 text-xs text-gray-900 dark:text-white"
                    >
                      {email}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        {canManage && (
          <div className="flex flex-wrap items-center justify-end gap-2">
            {onSendNow && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onSendNow}
                disabled={!canSendNow || sendPending}
                title="One email per domain, last 7 days of WAF data"
              >
                {sendPending ? "Sending…" : "Send 7-day report now"}
              </Button>
            )}
            <Button onClick={onEdit} variant="outline" size="sm">
              Edit
            </Button>
            <Button
              onClick={onRemove}
              variant="outline"
              size="sm"
              className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300"
            >
              Remove
            </Button>
          </div>
        )}
      </div>
    </GlassCard>
  );
}

/** Email tag for summary reports */
function SummaryEmailTag({
  email,
  onRemove,
  removable = true,
}: {
  email: string;
  onRemove: () => void;
  removable?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white dark:border-white/10 dark:bg-white/[0.03] px-3 py-1.5 text-xs text-gray-900 dark:text-white">
      <span className="truncate max-w-[260px]">{email}</span>
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          className="rounded-full p-1 text-gray-400 hover:text-black/70 dark:text-gray-500 dark:hover:text-white/70 transition-colors"
          aria-label={`Remove ${email}`}
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
}
