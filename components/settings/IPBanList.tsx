"use client";

import { useMemo, useState } from "react";
import ReactCountryFlag from "react-country-flag";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useConfirmation } from "@/components/providers/ConfirmationProvider";

// Mock data for IP bans
const mockIPBans = [
  {
    id: "1",
    ip: "192.168.1.100",
    country: "US",
    countryName: "United States",
    bannedAt: "2024-01-15T10:30:00Z",
    reason: "Suspicious activity detected",
    domain: "All",
  },
  {
    id: "2",
    ip: "203.0.113.45",
    country: "CN",
    countryName: "China",
    bannedAt: "2024-01-14T15:20:00Z",
    reason: "Multiple failed login attempts",
    domain: "waf.zergaw.com",
  },
  {
    id: "3",
    ip: "198.51.100.23",
    country: "RU",
    countryName: "Russia",
    bannedAt: "2024-01-13T09:15:00Z",
    reason: "SQL injection attempt",
    domain: "sales.zergaw.com",
  },
  {
    id: "4",
    ip: "203.0.113.78",
    country: "GB",
    countryName: "United Kingdom",
    bannedAt: "2024-01-12T14:45:00Z",
    reason: "XSS attack detected",
    domain: "All",
  },
  {
    id: "5",
    ip: "198.51.100.156",
    country: "DE",
    countryName: "Germany",
    bannedAt: "2024-01-11T11:30:00Z",
    reason: "Brute force attack",
    domain: "waf.zergaw.com",
  },
  {
    id: "6",
    ip: "192.0.2.89",
    country: "FR",
    countryName: "France",
    bannedAt: "2024-01-10T16:20:00Z",
    reason: "Malicious payload detected",
    domain: "sales.zergaw.com",
  },
];

interface IPBan {
  id: string;
  ip: string;
  country: string;
  countryName: string;
  bannedAt: string;
  reason: string;
  domain: string;
}

interface IPBanListProps {
  domains: string[];
}

export function IPBanList({ domains }: IPBanListProps) {
  const { confirm } = useConfirmation();

  const [ipBans, setIpBans] = useState<IPBan[]>(mockIPBans);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newIP, setNewIP] = useState("");
  const [newCountry, setNewCountry] = useState("");
  const [newReason, setNewReason] = useState("");
  const [newDomain, setNewDomain] = useState("All");

  const resetForm = () => {
    setNewIP("");
    setNewCountry("");
    setNewReason("");
    setNewDomain("All");
  };

  const domainOptions = useMemo(() => ["All", ...domains], [domains]);

  const handleAddIP = () => {
    if (!newIP.trim()) return;

    // Simple IP validation (same as your original)
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(newIP)) {
      toast.error("Please enter a valid IP address");
      return;
    }

    const newBan: IPBan = {
      id: Date.now().toString(),
      ip: newIP,
      country: newCountry || "XX",
      countryName: newCountry || "Unknown",
      bannedAt: new Date().toISOString(),
      reason: newReason || "Manually added",
      domain: newDomain,
    };

    setIpBans([newBan, ...ipBans]);
    resetForm();
    setShowAddForm(false);
    toast.success("IP ban added successfully");
  };

  const handleDeleteIP = async (id: string, ip: string) => {
    const confirmed = await confirm({
      title: "Remove IP Ban",
      message: `Are you sure you want to remove the IP ban for ${ip}?`,
      confirmText: "Remove",
      cancelText: "Cancel",
      variant: "danger",
    });

    if (confirmed) {
      setIpBans(ipBans.filter((ban) => ban.id !== id));
      toast.success("IP ban removed successfully");
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
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm dark:bg-black/70"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
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
                  setShowAddForm(false);
                  resetForm();
                }}
                className="grid h-9 w-9 place-items-center rounded-full bg-black/5 text-black/60 transition hover:bg-black/10 dark:bg-white/10 dark:text-white/70 dark:hover:bg-white/15"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="border-t border-black/5 px-6 py-6 dark:border-white/10">
              <div className="space-y-4">
                <Input
                  label="IP Address"
                  type="text"
                  placeholder="192.168.1.1"
                  value={newIP}
                  onChange={(e) => setNewIP(e.target.value)}
                />

                <div className="w-full">
                  <label className="mb-2 block text-sm font-medium text-black/70 dark:text-white/70">
                    Domain
                  </label>
                  <select
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    className="w-full rounded-xl border border-black/10 bg-white/70 px-4 py-3 text-sm text-[#1d1d1f] shadow-sm outline-none backdrop-blur transition focus:border-black/20 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-[#0f0f12] dark:text-white dark:focus:border-white/20 dark:focus:ring-white/10"
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
                  label="Country Code (optional)"
                  type="text"
                  placeholder="US, GB, FR…"
                  value={newCountry}
                  onChange={(e) => setNewCountry(e.target.value.toUpperCase())}
                  maxLength={2}
                />

                <Input
                  label="Reason (optional)"
                  type="text"
                  placeholder="Why is this IP banned?"
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                />
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    resetForm();
                  }}
                  className="flex-1 rounded-full border border-black/10 bg-white/60 px-4 py-2.5 text-sm font-medium text-black/70 shadow-sm backdrop-blur transition hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddIP}
                  className="flex-1 rounded-full bg-[#0071e3] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:brightness-95 active:brightness-90"
                >
                  Add Ban
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* List card (Apple-like) */}
      <GlassCard className="overflow-hidden">
        {ipBans.length === 0 ? (
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
            {ipBans.map((ban) => (
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

                    <DomainPill value={ban.domain} />

                    <CountryPill code={ban.country} name={ban.countryName} />
                  </div>

                  {/* Sub line */}
                  <div className="mt-2 flex flex-col gap-1 text-xs text-black/60 dark:text-white/60">
                    <p className="line-clamp-2">
                      <span className="font-medium text-black/70 dark:text-white/70">
                        Reason:
                      </span>{" "}
                      {ban.reason}
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
                    className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-500/15 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Remove
                  </button>
                </div>
              </div>
            ))}
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
