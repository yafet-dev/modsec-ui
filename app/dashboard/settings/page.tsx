"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRole } from "@/components/providers/RoleProvider";
import { LayoutWrapper } from "@/components/ui/LayoutWrapper";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useMyOrganizations } from "@/lib/api/hooks/useOrganization";
import { useDomainWafStatus, useToggleDomainWaf } from "@/lib/api/hooks/useDomainWaf";
import { WAFSettingsSkeleton } from "@/components/settings/WAFSettingsSkeleton";
import { IPBanList } from "@/components/settings/IPBanList";
import { GeoLocationAccess } from "@/components/settings/GeoLocationAccess";
import { NotificationsSettings } from "@/components/settings/NotificationsSettings";

type TabKey = "waf" | "ip-ban" | "geo-location" | "notifications";

const tabs = [
  { key: "waf" as const, label: "WAF" },
  { key: "ip-ban" as const, label: "IP Ban List" },
  { key: "geo-location" as const, label: "Geo Access" },
  { key: "notifications" as const, label: "Notifications" },
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
  const [savedSummarySettings, setSavedSummarySettings] = useState<SavedSummarySettings | null>(null);

  const { isAuthenticated } = useAuth();
  const { currentRole } = useRole();
  const router = useRouter();

  const { data: myOrganizations, isLoading: orgsLoading } = useMyOrganizations();

  const organization = myOrganizations?.[0];
  const { data: wafStatus, isLoading: wafLoading } = useDomainWafStatus(organization?.id || null);
  const toggleMutation = useToggleDomainWaf();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    } else if (currentRole === "super_admin") {
      router.push("/owner/dashboard");
    }
  }, [isAuthenticated, currentRole, router]);

  if (!isAuthenticated || currentRole === "super_admin") return null;

  const isLoading = orgsLoading || wafLoading;
  const hasOrganization = !!organization;
  const domains = organization?.domains || [];

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
    if (savedSummarySettings) {
      setSummaryEnabled(savedSummarySettings.enabled);
      setSummaryFrequency(savedSummarySettings.frequency);
      setSummaryEmails(savedSummarySettings.emails);
    }
    setIsSummaryEditMode(true);
  };

  const handleCancelSummaryEdit = () => {
    setIsSummaryEditMode(false);
    if (savedSummarySettings) {
      setSummaryEnabled(savedSummarySettings.enabled);
      setSummaryFrequency(savedSummarySettings.frequency);
      setSummaryEmails(savedSummarySettings.emails);
    } else {
      setSummaryEnabled(true);
      setSummaryFrequency("daily");
      setSummaryEmails([]);
    }
  };

  const handleSaveSummarySettings = () => {
    if (summaryEnabled && summaryEmails.length === 0) {
      toast.error("Please add at least one email address to receive reports");
      return;
    }

    const settings: SavedSummarySettings = {
      enabled: summaryEnabled,
      frequency: summaryFrequency,
      emails: summaryEmails,
    };
    setSavedSummarySettings(settings);
    setIsSummaryEditMode(false);
    toast.success("Summary report settings saved successfully");
  };

  const handleRemoveSummarySettings = () => {
    setSavedSummarySettings(null);
    setIsSummaryEditMode(false);
    setSummaryEnabled(true);
    setSummaryFrequency("daily");
    setSummaryEmails([]);
    toast.success("Summary report settings removed");
  };

  return (
    <LayoutWrapper>
      {/* Apple-ish page background */}
      <main className="min-h-[calc(100vh-64px)] bg-[#f5f5f7] dark:bg-[#0b0b0f]">
        <Section>
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
            {/* Header (big Apple-style typography) */}
            <div className="mb-8">
              <p className="text-xs tracking-wide text-black/60 dark:text-white/60">
                Settings
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1d1d1f] dark:text-white sm:text-4xl">
                Security & Controls
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-black/60 dark:text-white/60">
                Manage Web Application Firewall protection, access controls, and notifications
                with a clean, per-domain configuration.
              </p>
            </div>

            {/* Segmented control navigation */}
            <div className="mb-8">
              <AppleSegmentedTabs
                tabs={tabs}
                value={activeTab}
                onChange={setActiveTab}
              />
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
                        className="h-6 w-6 text-black/50 dark:text-white/60"
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
                    <h2 className="text-lg font-semibold text-[#1d1d1f] dark:text-white">
                      No organization found
                    </h2>
                    <p className="mt-2 text-sm text-black/60 dark:text-white/60">
                      You need to be a member of an organization to manage WAF settings.
                    </p>
                  </GlassCard>
                ) : (
                  <div className="space-y-6">
                    {/* Org card */}
                    <GlassCard className="p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h2 className="text-xl font-semibold tracking-tight text-[#1d1d1f] dark:text-white">
                            {organization.name}
                          </h2>
                          <p className="mt-1 text-xs text-black/60 dark:text-white/60">
                            Organization ID: {organization.id.slice(0, 8)}…
                          </p>
                        </div>

                        <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs font-medium text-black/70 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-white/70">
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
                        <h3 className="text-lg font-semibold tracking-tight text-[#1d1d1f] dark:text-white">
                          WAF Protection
                        </h3>
                        <p className="mt-1 text-sm text-black/60 dark:text-white/60">
                          Enable or disable protection for each domain.
                        </p>
                      </div>

                      <div className="border-t border-black/5 dark:border-white/10">
                        {domains.length === 0 ? (
                          <div className="px-6 py-10 text-center text-sm text-black/60 dark:text-white/60">
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
                                      <p className="truncate font-mono text-sm font-medium text-[#1d1d1f] dark:text-white">
                                        {domain}
                                      </p>
                                      <AppleStatusPill enabled={wafEnabled} />
                                    </div>
                                    <p className="mt-1 text-xs text-black/60 dark:text-white/60">
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
                                    <div className="absolute inset-0 grid place-items-center bg-white/40 backdrop-blur dark:bg-black/30">
                                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-black/20 border-t-black/60 dark:border-white/20 dark:border-t-white/70" />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {domains.length > 0 && (
                        <div className="border-t border-black/5 px-6 py-4 text-xs text-black/60 dark:border-white/10 dark:text-white/60">
                          When enabled, the WAF helps block common threats like SQL injection,
                          XSS, and malicious traffic patterns.
                        </div>
                      )}
                    </GlassCard>

                    {/* Summary reports */}
                    {savedSummarySettings && !isSummaryEditMode ? (
                      <SummaryReportsSummary
                        settings={savedSummarySettings}
                        onEdit={handleEditSummarySettings}
                        onRemove={handleRemoveSummarySettings}
                      />
                    ) : !savedSummarySettings && !isSummaryEditMode ? (
                      <GlassCard className="p-6">
                        <div className="text-center py-8">
                          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-black/5 dark:bg-white/10">
                            <svg
                              className="h-6 w-6 text-black/50 dark:text-white/60"
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
                          <h3 className="text-lg font-semibold text-[#1d1d1f] dark:text-white mb-2">
                            No Summary Reports Configured
                          </h3>
                          <p className="text-sm text-black/60 dark:text-white/60 mb-6">
                            Set up summary reports to receive periodic WAF activity summaries.
                          </p>
                          <Button onClick={() => setIsSummaryEditMode(true)} variant="primary" size="md">
                            Configure Summary Reports
                          </Button>
                        </div>
                      </GlassCard>
                    ) : (
                      <GlassCard className="p-6">
                        <div className="flex items-start justify-between gap-6">
                          <div>
                            <h3 className="text-lg font-semibold tracking-tight text-[#1d1d1f] dark:text-white">
                              Summary Reports
                            </h3>
                            <p className="mt-1 text-sm text-black/60 dark:text-white/60">
                              Receive periodic summaries of WAF activity.
                            </p>
                          </div>

                          <AppleSwitch
                            enabled={summaryEnabled}
                            onToggle={() => setSummaryEnabled((v) => !v)}
                          />
                        </div>

                        {summaryEnabled && (
                          <div className="mt-6 space-y-6 border-t border-black/5 pt-6 dark:border-white/10">
                            {/* Email Addresses */}
                            <div>
                              <label className="block text-xs font-medium tracking-wide text-black/60 dark:text-white/60 mb-2">
                                Email Addresses
                              </label>
                              <p className="mb-3 text-xs text-black/50 dark:text-white/50">
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
                                />
                                <Button
                                  onClick={handleAddSummaryEmail}
                                  variant="primary"
                                  size="md"
                                  className="px-6"
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
                                    />
                                  ))}
                                </div>
                              )}

                              {summaryEmails.length === 0 && (
                                <p className="mt-2 text-xs text-black/50 dark:text-white/50 italic">
                                  No email addresses added yet. Add at least one to receive reports.
                                </p>
                              )}
                            </div>

                            {/* Frequency */}
                            <div>
                              <label className="block text-xs font-medium tracking-wide text-black/60 dark:text-white/60">
                                Frequency
                              </label>

                              <div className="mt-2">
                                <select
                                  value={summaryFrequency}
                                  onChange={(e) => setSummaryFrequency(e.target.value)}
                                  className="w-full rounded-xl border border-black/10 bg-white/70 px-4 py-3 text-sm text-[#1d1d1f] shadow-sm outline-none backdrop-blur transition focus:border-black/20 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-white/20 dark:focus:ring-white/10"
                                >
                                  <option value="hourly">Hourly</option>
                                  <option value="daily">Daily</option>
                                  <option value="weekly">Weekly</option>
                                  <option value="monthly">Monthly</option>
                                </select>

                                <p className="mt-2 text-xs text-black/60 dark:text-white/60">
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

                        {/* Save/Cancel buttons */}
                        <div className="mt-6 flex justify-end gap-3 border-t border-black/5 pt-6 dark:border-white/10">
                          {savedSummarySettings && (
                            <Button onClick={handleCancelSummaryEdit} variant="outline" size="md">
                              Cancel
                            </Button>
                          )}
                          <Button onClick={handleSaveSummarySettings} variant="primary" size="md">
                            Save Settings
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
            ) : (
              <NotificationsSettings domains={domains} organizationId={organization?.id || null} />
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
        "rounded-2xl border border-black/10 bg-white/70 shadow-[0_1px_0_rgba(0,0,0,0.04),0_10px_30px_rgba(0,0,0,0.06)] backdrop-blur",
        "dark:border-white/10 dark:bg-white/[0.06] dark:shadow-[0_1px_0_rgba(255,255,255,0.06),0_18px_40px_rgba(0,0,0,0.45)]",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

/** Apple-ish segmented tabs */
function AppleSegmentedTabs({
  tabs,
  value,
  onChange,
}: {
  tabs: { key: TabKey; label: string }[];
  value: TabKey;
  onChange: (v: TabKey) => void;
}) {
  return (
    <div className="inline-flex rounded-full border border-black/10 bg-white/60 p-1 backdrop-blur dark:border-white/10 dark:bg-white/[0.06]">
      {tabs.map((t) => {
        const active = t.key === value;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={[
              "relative rounded-full px-4 py-2 text-sm font-medium transition",
              active
                ? "bg-white text-[#1d1d1f] shadow-sm dark:bg-white/15 dark:text-white"
                : "text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white",
            ].join(" ")}
            aria-current={active ? "page" : undefined}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

/** Apple-ish status pill */
function AppleStatusPill({ enabled }: { enabled: boolean }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-medium",
        "bg-white/60 text-black/70 border-black/10",
        "dark:bg-white/[0.06] dark:text-white/70 dark:border-white/10",
      ].join(" ")}
    >
      <span
        className={[
          "h-1.5 w-1.5 rounded-full",
          enabled ? "bg-emerald-500" : "bg-black/30 dark:bg-white/30",
        ].join(" ")}
      />
      {enabled ? "Enabled" : "Disabled"}
    </span>
  );
}

/** Apple-ish switch */
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
        "relative inline-flex h-7 w-12 items-center rounded-full transition",
        "outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        enabled
          ? "bg-[#0071e3] shadow-inner"
          : "bg-black/10 dark:bg-white/15",
      ].join(" ")}
      aria-label={enabled ? "Disable" : "Enable"}
    >
      <span
        className={[
          "absolute left-1 inline-block h-5 w-5 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.2)] transition-transform",
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
}: {
  settings: SavedSummarySettings;
  onEdit: () => void;
  onRemove: () => void;
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
            <div className="h-10 w-10 rounded-2xl border border-black/10 bg-white/70 dark:border-white/10 dark:bg-white/5 backdrop-blur flex items-center justify-center text-black/50 dark:text-white/50">
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
              <h3 className="text-lg font-semibold tracking-tight text-[#1d1d1f] dark:text-white">
                Summary Reports
              </h3>
              <p className="mt-1 text-sm text-black/60 dark:text-white/60">
                Summary reports are currently disabled.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={onEdit} variant="outline" size="sm">
              Edit
            </Button>
            <Button onClick={onRemove} variant="outline" size="sm" className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300">
              Remove
            </Button>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-start gap-4 flex-1">
          <div className="h-10 w-10 rounded-2xl border border-black/10 bg-white/70 dark:border-white/10 dark:bg-white/5 backdrop-blur flex items-center justify-center text-[#1d1d1f] dark:text-white">
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
            <h3 className="text-lg font-semibold tracking-tight text-[#1d1d1f] dark:text-white">
              Summary Reports
            </h3>
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2 text-sm text-black/60 dark:text-white/60">
                <span className="font-medium">Frequency:</span>
                <span>{getFrequencyText()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-black/60 dark:text-white/60">
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
                      className="inline-flex items-center rounded-full border border-black/10 bg-white/70 dark:border-white/10 dark:bg-white/5 backdrop-blur px-3 py-1 text-xs text-[#1d1d1f] dark:text-white"
                    >
                      {email}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={onEdit} variant="outline" size="sm">
            Edit
          </Button>
          <Button onClick={onRemove} variant="outline" size="sm" className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300">
            Remove
          </Button>
        </div>
      </div>
    </GlassCard>
  );
}

/** Email tag for summary reports */
function SummaryEmailTag({
  email,
  onRemove,
}: {
  email: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 dark:border-white/10 dark:bg-white/5 backdrop-blur px-3 py-1.5 text-xs text-[#1d1d1f] dark:text-white">
      <span className="truncate max-w-[260px]">{email}</span>
      <button
        type="button"
        onClick={onRemove}
        className="rounded-full p-1 text-black/40 hover:text-black/70 dark:text-white/40 dark:hover:text-white/70 transition-colors"
        aria-label={`Remove ${email}`}
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
}
