"use client";

import { useMemo, useState, useEffect } from "react";
import ReactCountryFlag from "react-country-flag";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useConfirmation } from "@/components/providers/ConfirmationProvider";
import { useIPBans, useCreateIPBan, useDeleteIPBan } from "@/lib/api/hooks/useIPBan";
import { IPBan } from "@/lib/api/ipBan";
import { ipGeolocationApi } from "@/lib/api/ipGeolocation";

interface IPBanListProps {
  domains: string[];
  organizationId: string | null;
}

export function IPBanList({ domains, organizationId }: IPBanListProps) {
  const { confirm } = useConfirmation();
  const { data: ipBans = [], isLoading } = useIPBans(organizationId);
  const createMutation = useCreateIPBan();
  const deleteMutation = useDeleteIPBan();

  const [showAddForm, setShowAddForm] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const [newIP, setNewIP] = useState("");
  const [newReason, setNewReason] = useState("");
  const [newDomain, setNewDomain] = useState("All");
  const [detectedCountry, setDetectedCountry] = useState<{ code: string; name: string } | null>(null);
  const [isDetectingCountry, setIsDetectingCountry] = useState(false);

  const resetForm = () => {
    setNewIP("");
    setNewReason("");
    setNewDomain("All");
    setDetectedCountry(null);
  };

  // Auto-detect country when IP is entered (debounced)
  useEffect(() => {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    
    if (!newIP.trim() || !ipRegex.test(newIP)) {
      setDetectedCountry(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsDetectingCountry(true);
      try {
        const geoData = await ipGeolocationApi.getCountryFromIP(newIP);
        if (geoData.country && geoData.countryName) {
          setDetectedCountry({
            code: geoData.country,
            name: geoData.countryName,
          });
        } else {
          setDetectedCountry(null);
        }
      } catch (error) {
        console.error("Failed to detect country:", error);
        setDetectedCountry(null);
      } finally {
        setIsDetectingCountry(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [newIP]);

  const domainOptions = useMemo(() => ["All", ...domains], [domains]);

  const handleAddIP = async () => {
    if (!newIP.trim()) return;

    // Simple IP validation
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(newIP)) {
      return;
    }

    if (!organizationId) {
      return;
    }

    // If "All" is selected, send ["*"] - backend will resolve to all organization domains
    const targetDomains = newDomain === "All" ? ["*"] : [newDomain];

    createMutation.mutate(
      {
        organizationId,
        data: {
          ip: newIP,
          domains: targetDomains,
          // Country will be auto-detected by backend from IP
          reason: newReason || undefined,
        },
      },
      {
        onSuccess: () => {
          // Only close modal and reset form on success
          resetForm();
          setShowAddForm(false);
        },
      }
    );
  };

  const handleDeleteIP = async (id: string, ip: string) => {
    const confirmed = await confirm({
      title: "Remove IP Ban",
      message: `Are you sure you want to remove the IP ban for ${ip}?`,
      confirmText: "Remove",
      cancelText: "Cancel",
      variant: "danger",
    });

    if (confirmed && organizationId) {
      setRemovingId(id);
      deleteMutation.mutate(
        {
          organizationId,
          ipBanId: id,
        },
        {
          onSettled: () => {
            // Clear removing state after mutation completes (success or error)
            setRemovingId(null);
          },
        }
      );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Apple-ish header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs tracking-wide text-black/60 dark:text-white/60">
            Access Control
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#1d1d1f] dark:text-white">
            IP Ban List
          </h2>
          <p className="mt-2 text-sm text-black/60 dark:text-white/60">
            Manage banned IP addresses and their restrictions per domain.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0071e3] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:brightness-95 active:brightness-90"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add IP Ban
        </button>
      </div>

      {/* Add IP Modal (Apple-like sheet) */}
      {showAddForm && (
        <div
          className="fixed inset-0 z-[60] grid place-items-center bg-black/50 p-4 backdrop-blur-sm dark:bg-black/70"
          onClick={(e) => {
            if (e.target === e.currentTarget && !createMutation.isPending) {
              setShowAddForm(false);
              resetForm();
            }
          }}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-3xl border border-black/10 bg-white/80 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur dark:border-white/10 dark:bg-white/[0.06]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5">
              <div>
                <h3 className="text-lg font-semibold tracking-tight text-[#1d1d1f] dark:text-white">
                  Add IP Ban
                </h3>
                <p className="mt-1 text-xs text-black/60 dark:text-white/60">
                  Block an IP across all domains or a single domain.
                </p>
              </div>

              <button
                onClick={() => {
                  if (!createMutation.isPending) {
                    setShowAddForm(false);
                    resetForm();
                  }
                }}
                disabled={createMutation.isPending}
                className="grid h-9 w-9 place-items-center rounded-full bg-black/5 text-black/60 transition hover:bg-black/10 dark:bg-white/10 dark:text-white/70 dark:hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="border-t border-black/5 px-6 py-6 dark:border-white/10">
              <div className="space-y-4">
                <div>
                  <Input
                    label="IP Address"
                    type="text"
                    placeholder="192.168.1.1"
                    value={newIP}
                    onChange={(e) => setNewIP(e.target.value)}
                    disabled={createMutation.isPending}
                  />
                  {isDetectingCountry && (
                    <p className="mt-1 text-xs text-black/60 dark:text-white/60">
                      Detecting country...
                    </p>
                  )}
                  {detectedCountry && !isDetectingCountry && (
                    <div className="mt-2 flex items-center gap-2">
                      <ReactCountryFlag
                        countryCode={detectedCountry.code}
                        svg
                        style={{ width: "16px", height: "16px", borderRadius: "3px" }}
                        title={detectedCountry.name}
                      />
                      <span className="text-xs text-black/70 dark:text-white/70">
                        {detectedCountry.name}
                      </span>
                    </div>
                  )}
                </div>

                <div className="w-full">
                  <label className="mb-2 block text-sm font-medium text-black/70 dark:text-white/70">
                    Domain
                  </label>
                  <select
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    disabled={createMutation.isPending}
                    className="w-full rounded-xl border border-black/10 bg-white/70 px-4 py-3 text-sm text-[#1d1d1f] shadow-sm outline-none backdrop-blur transition focus:border-black/20 focus:ring-2 focus:ring-black/10 disabled:opacity-50 disabled:cursor-not-allowed dark:border-white/10 dark:bg-[#0f0f12] dark:text-white dark:focus:border-white/20 dark:focus:ring-white/10"
                  >
                    {domainOptions.map((d) => (
                      <option
                        key={d}
                        value={d}
                        className="bg-white text-[#1d1d1f] dark:bg-[#0f0f12] dark:text-white"
                      >
                        {d === "All" ? "All Domains" : d}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Reason (optional)"
                  type="text"
                  placeholder="Why is this IP banned?"
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  disabled={createMutation.isPending}
                />
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    if (!createMutation.isPending) {
                      setShowAddForm(false);
                      resetForm();
                    }
                  }}
                  disabled={createMutation.isPending}
                  className="flex-1 rounded-full border border-black/10 bg-white/60 px-4 py-2.5 text-sm font-medium text-black/70 shadow-sm backdrop-blur transition hover:bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddIP}
                  disabled={createMutation.isPending || !newIP.trim()}
                  className="flex-1 rounded-full bg-[#0071e3] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:brightness-95 active:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createMutation.isPending ? "Banning..." : "Add Ban"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* List card (Apple-like) */}
      <GlassCard className="overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-black/5 dark:bg-white/10">
              <svg className="h-6 w-6 animate-spin text-black/40 dark:text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#1d1d1f] dark:text-white">
              Loading...
            </h3>
          </div>
        ) : ipBans.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-black/5 dark:bg-white/10">
              <svg className="h-6 w-6 text-black/40 dark:text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#1d1d1f] dark:text-white">
              No IP Bans
            </h3>
            <p className="mt-2 text-sm text-black/60 dark:text-white/60">
              No IP addresses are currently banned.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-black/5 dark:divide-white/10">
            {ipBans.map((ban) => {
              // Handle domains array - show "All" if contains "*" or all domains, otherwise show first domain
              const displayDomain = ban.domains.includes("*") || ban.domains.length === domains.length
                ? "All"
                : ban.domains[0] || "Unknown";

              return (
                <div
                  key={ban.id}
                  className="flex flex-col gap-3 px-6 py-5 transition hover:bg-black/[0.03] dark:hover:bg-white/[0.04] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    {/* Top line */}
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-sm font-semibold text-[#1d1d1f] dark:text-white">
                        {ban.ip}
                      </span>

                      <DomainPill value={displayDomain} />

                      <CountryPill code={ban.country || "XX"} name={ban.countryName || "Unknown"} />
                    </div>

                    {/* Sub line */}
                    <div className="mt-2 flex flex-col gap-1 text-xs text-black/60 dark:text-white/60">
                      <p className="line-clamp-2">
                        <span className="font-medium text-black/70 dark:text-white/70">
                          Reason:
                        </span>{" "}
                        {ban.reason || "Manually added"}
                      </p>
                      <p>
                        <span className="font-medium text-black/70 dark:text-white/70">
                          Banned:
                        </span>{" "}
                        {formatDate(ban.bannedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center justify-end gap-2">
                    <button
                      onClick={() => handleDeleteIP(ban.id, ban.ip)}
                      disabled={removingId === ban.id || (removingId !== null && removingId !== ban.id)}
                      className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-500/15 disabled:opacity-50 disabled:cursor-not-allowed dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      {removingId === ban.id ? "Removing..." : "Remove"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>

      {/* Info footer (Apple-ish callout) */}
      {ipBans.length > 0 && (
        <div className="rounded-2xl border border-black/10 bg-white/60 p-5 text-sm text-black/60 backdrop-blur dark:border-white/10 dark:bg-white/[0.06] dark:text-white/60">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 grid h-8 w-8 place-items-center rounded-full bg-black/5 dark:bg-white/10">
              <svg className="h-5 w-5 text-black/40 dark:text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <div>
              <p className="font-medium text-black/70 dark:text-white/70">
                About IP bans
              </p>
              <p className="mt-1 text-xs leading-5">
                Banned IP addresses are blocked from accessing your protected domains.
                You can add IPs manually, or they may be added automatically when suspicious activity is detected.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- small Apple-ish UI primitives (kept local) ---------- */

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

function DomainPill({ value }: { value: string }) {
  const isAll = value === "All";
  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-medium",
        "bg-white/60 text-black/70 border-black/10",
        "dark:bg-white/[0.06] dark:text-white/70 dark:border-white/10",
      ].join(" ")}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isAll ? "bg-[#7c3aed]" : "bg-black/30 dark:bg-white/30"}`} />
      {isAll ? "All Domains" : value}
    </span>
  );
}

function CountryPill({ code, name }: { code: string; name: string }) {
  const hasCountry = code !== "XX";
  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-medium",
        "bg-white/60 text-black/70 border-black/10",
        "dark:bg-white/[0.06] dark:text-white/70 dark:border-white/10",
      ].join(" ")}
    >
      {hasCountry ? (
        <ReactCountryFlag
          countryCode={code}
          svg
          style={{ width: "16px", height: "16px", borderRadius: "3px" }}
          title={name}
        />
      ) : (
        <span className="grid h-4 w-4 place-items-center rounded bg-black/10 text-[10px] text-black/60 dark:bg-white/10 dark:text-white/60">
          ?
        </span>
      )}
      {name}
    </span>
  );
}
