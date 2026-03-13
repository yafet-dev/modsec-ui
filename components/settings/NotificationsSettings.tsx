"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  useNotificationSettings,
  useCreateNotificationSettings,
  useUpdateNotificationSettings,
  useDeleteNotificationSettings,
  useSendSampleNotification,
  useTelegramStatus,
  useTelegramStartLink,
  useTelegramDisconnect,
  useTelegramTest,
} from "@/lib/api/hooks/useNotificationSettings";
import type { NotificationSettings, TelegramStartLinkResponse } from "@/lib/api/notificationSettings";

type NotificationType = "email" | "telegram";
type SeverityFilter = "all" | "critical" | "high" | "low";
type DomainFilter = "all" | "specific";

interface NotificationsSettingsProps {
  domains: string[];
  organizationId: string | null;
}

function Section({
  title,
  description,
  right,
  children,
}: {
  title: string;
  description?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl shadow-[0_1px_0_rgba(0,0,0,0.04)]">
      <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-black/5 dark:border-white/10">
        <div>
          <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-zinc-900 dark:text-zinc-100">
            {title}
          </h3>
          {description ? (
            <p className="mt-1 text-[13px] leading-5 text-zinc-500 dark:text-zinc-400">
              {description}
            </p>
          ) : null}
        </div>
        {right ? <div className="pt-0.5">{right}</div> : null}
      </div>
      <div className="px-6 py-6">{children}</div>
    </section>
  );
}

function TileButton({
  active,
  title,
  subtitle,
  icon,
  tint = "zinc",
  onClick,
}: {
  active: boolean;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  tint?: "zinc" | "green";
  onClick: () => void;
}) {
  const activeBorder =
    "border-zinc-900/20 dark:border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.06)]";
  const idleBorder =
    "border-black/5 dark:border-white/10 hover:border-zinc-900/15 dark:hover:border-white/15";

  const badge =
    tint === "green"
      ? active
        ? "bg-emerald-500"
        : "bg-zinc-200 dark:bg-zinc-700"
      : active
      ? "bg-zinc-900 dark:bg-zinc-100"
      : "bg-zinc-200 dark:bg-zinc-700";

  const badgeIcon =
    tint === "green"
      ? "text-white"
      : active
      ? "text-white dark:text-zinc-900"
      : "text-white";

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full text-left rounded-3xl border transition-all",
        "p-5 bg-white/70 dark:bg-white/5 backdrop-blur",
        active ? activeBorder : idleBorder,
      ].join(" ")}
    >
      <div className="flex items-start gap-4">
        <div className={["h-10 w-10 rounded-2xl flex items-center justify-center", badge].join(" ")}>
          <div className={badgeIcon}>{icon}</div>
        </div>
        <div className="flex-1">
          <div className="text-[14px] font-semibold tracking-[-0.01em] text-zinc-900 dark:text-zinc-100">
            {title}
          </div>
          <div className="mt-1 text-[13px] leading-5 text-zinc-500 dark:text-zinc-400">
            {subtitle}
          </div>
        </div>

        <div
          className={[
            "mt-1 h-5 w-5 rounded-full border flex items-center justify-center transition-colors",
            active ? "border-zinc-900 dark:border-zinc-100" : "border-zinc-300 dark:border-zinc-600",
          ].join(" ")}
          aria-hidden="true"
        >
          <div
            className={[
              "h-2.5 w-2.5 rounded-full transition-opacity",
              active ? "bg-zinc-900 dark:bg-zinc-100 opacity-100" : "opacity-0",
            ].join(" ")}
          />
        </div>
      </div>
    </button>
  );
}

function RadioPill({
  active,
  title,
  subtitle,
  onSelect,
}: {
  active: boolean;
  title: string;
  subtitle: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "w-full rounded-2xl border px-4 py-4 text-left transition-all",
        "bg-white/70 dark:bg-white/5 backdrop-blur",
        active
          ? "border-zinc-900/20 dark:border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
          : "border-black/5 dark:border-white/10 hover:border-zinc-900/15 dark:hover:border-white/15",
      ].join(" ")}
    >
      <div className="flex items-start gap-4">
        <span
          className={[
            "mt-0.5 h-5 w-5 rounded-full border flex items-center justify-center",
            active ? "border-zinc-900 dark:border-zinc-100" : "border-zinc-300 dark:border-zinc-600",
          ].join(" ")}
          aria-hidden="true"
        >
          <span
            className={[
              "h-2.5 w-2.5 rounded-full",
              active ? "bg-zinc-900 dark:bg-zinc-100" : "bg-transparent",
            ].join(" ")}
          />
        </span>

        <div className="flex-1">
          <div className="text-[14px] font-semibold tracking-[-0.01em] text-zinc-900 dark:text-zinc-100">
            {title}
          </div>
          <div className="mt-1 text-[13px] leading-5 text-zinc-500 dark:text-zinc-400">
            {subtitle}
          </div>
        </div>
      </div>
    </button>
  );
}

function ChoiceChip({
  active,
  label,
  caption,
  tone = "neutral",
  onSelect,
}: {
  active: boolean;
  label: string;
  caption: string;
  tone?: "neutral" | "critical" | "high" | "low";
  onSelect: () => void;
}) {
  const borderIdle = "border border-black/5 dark:border-white/10 hover:border-zinc-900/15 dark:hover:border-white/15";
  
  const borderActive =
    tone === "critical"
      ? "border-2 border-rose-500/40 dark:border-rose-400/50"
      : tone === "high"
      ? "border-2 border-orange-500/40 dark:border-orange-400/50"
      : tone === "low"
      ? "border-2 border-amber-500/40 dark:border-amber-400/50"
      : "border-2 border-zinc-900/30 dark:border-white/30";

  const labelColor =
    tone === "critical"
      ? active
        ? "text-rose-600 dark:text-rose-300"
        : "text-rose-600 dark:text-rose-400"
      : tone === "high"
      ? active
        ? "text-orange-600 dark:text-orange-300"
        : "text-orange-600 dark:text-orange-400"
      : tone === "low"
      ? active
        ? "text-amber-600 dark:text-amber-300"
        : "text-amber-600 dark:text-amber-400"
      : active
      ? "text-zinc-900 dark:text-white"
      : "text-zinc-900 dark:text-zinc-100";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "w-full rounded-2xl px-4 py-4 text-center transition-all",
        "bg-white/70 dark:bg-white/5 backdrop-blur",
        active ? borderActive : borderIdle,
        active ? "shadow-[0_10px_30px_rgba(0,0,0,0.06)]" : "",
      ].join(" ")}
    >
      <div className={["text-[14px] font-semibold tracking-[-0.01em]", labelColor].join(" ")}>
        {label}
      </div>
      <div className="mt-1 text-[12px] text-zinc-500 dark:text-zinc-400">{caption}</div>
    </button>
  );
}

function Tag({
  text,
  onRemove,
}: {
  text: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur px-3 py-1.5 text-[13px] text-zinc-800 dark:text-zinc-100">
      <span className="truncate max-w-[260px]">{text}</span>
      <button
        type="button"
        onClick={onRemove}
        className="rounded-full p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        aria-label={`Remove ${text}`}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
}

function NotificationSummary({
  settings,
  onEdit,
  onRemove,
  isRemoving = false,
}: {
  settings: NotificationSettings;
  onEdit: () => void;
  onRemove: () => void;
  isRemoving?: boolean;
}) {
  const getChannelIcon = () => {
    if (settings.notificationType === "email") {
      return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      );
    } else {
      return (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.13-.041-.186-.024c-.082.03-1.375.87-3.973 2.556-.376.2-.715.298-.996.29-.34-.01-.995-.192-1.48-.35-.765-.243-1.37-.375-1.32-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      );
    }
  };

  const getChannelName = () => {
    return settings.notificationType.charAt(0).toUpperCase() + settings.notificationType.slice(1);
  };

  const getDestination = () => {
    if (settings.notificationType === "email") {
      return settings.emailList.length > 0
        ? `${settings.emailList.length} email${settings.emailList.length > 1 ? "s" : ""}`
        : "No emails";
    } else {
      if (settings.telegramEnabled && settings.telegramChatId) {
        return `Connected (chat ${settings.telegramChatId})`;
      }
      return "Not connected";
    }
  };

  const getDomainFilterText = () => {
    if (settings.domainFilter === "all") {
      return "All domains";
    } else {
      return settings.selectedDomains.length > 0
        ? `${settings.selectedDomains.length} specific domain${settings.selectedDomains.length > 1 ? "s" : ""}`
        : "No domains selected";
    }
  };

  const getSeverityText = () => {
    const severityMap: Record<SeverityFilter, string> = {
      all: "All severities",
      critical: "Critical only",
      high: "High only",
      low: "Low only",
    };
    return severityMap[settings.severityFilter];
  };

  return (
    <div className="rounded-3xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl shadow-[0_1px_0_rgba(0,0,0,0.04)]">
      <div className="px-6 py-5 border-b border-black/5 dark:border-white/10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="h-10 w-10 rounded-2xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur flex items-center justify-center text-zinc-900 dark:text-zinc-100">
              {getChannelIcon()}
            </div>
            <div className="flex-1">
              <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-zinc-900 dark:text-zinc-100">
                {getChannelName()} Notifications
              </h3>
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2 text-[13px] text-zinc-600 dark:text-zinc-400">
                  <span className="font-medium">Destination:</span>
                  <span>{getDestination()}</span>
                </div>
                <div className="flex items-center gap-2 text-[13px] text-zinc-600 dark:text-zinc-400">
                  <span className="font-medium">Domains:</span>
                  <span>{getDomainFilterText()}</span>
                </div>
                <div className="flex items-center gap-2 text-[13px] text-zinc-600 dark:text-zinc-400">
                  <span className="font-medium">Severity:</span>
                  <span>{getSeverityText()}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={onEdit} variant="outline" size="sm" disabled={isRemoving}>
              Edit
            </Button>
            <Button 
              onClick={onRemove} 
              variant="outline" 
              size="sm" 
              disabled={isRemoving}
              className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRemoving ? "Removing..." : "Remove"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Telegram Connect Section — handles the full connect / status / disconnect flow
// ---------------------------------------------------------------------------
function TelegramConnectSection({
  organizationId,
}: {
  organizationId: string | null;
}) {
  const [linkData, setLinkData] = useState<TelegramStartLinkResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    data: telegramStatus,
    isLoading: isLoadingStatus,
  } = useTelegramStatus(organizationId || undefined);

  const startLinkMutation = useTelegramStartLink(organizationId || undefined);
  const disconnectMutation = useTelegramDisconnect(organizationId || undefined);
  const testMutation = useTelegramTest(organizationId || undefined);

  // Once connected, clear the link data
  useEffect(() => {
    if (telegramStatus?.connected && linkData) {
      setLinkData(null);
    }
  }, [telegramStatus?.connected, linkData]);

  const handleGenerateLink = async () => {
    if (!organizationId) return;
    try {
      const result = await startLinkMutation.mutateAsync();
      setLinkData(result);
    } catch {
      // error handled by hook
    }
  };

  const handleCopyLink = async () => {
    if (!linkData?.deepLink) return;
    try {
      await navigator.clipboard.writeText(linkData.deepLink);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleDisconnect = async () => {
    if (!organizationId) return;
    try {
      await disconnectMutation.mutateAsync();
    } catch {
      // error handled by hook
    }
  };

  const handleSendTest = async () => {
    try {
      await testMutation.mutateAsync();
    } catch {
      // error handled by hook
    }
  };

  // Loading
  if (isLoadingStatus) {
    return (
      <div className="flex items-center gap-3 py-4">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-900/20 border-t-zinc-900 dark:border-white/20 dark:border-t-white" />
        <span className="text-[13px] text-zinc-500 dark:text-zinc-400">
          Checking Telegram connection…
        </span>
      </div>
    );
  }

  // ——— CONNECTED STATE ———
  if (telegramStatus?.connected) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-950/20 backdrop-blur p-5">
          <div className="flex items-start gap-4">
            {/* Green check icon */}
            <div className="h-10 w-10 rounded-2xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-semibold text-emerald-800 dark:text-emerald-300">
                Telegram Connected
              </div>
              <div className="mt-1 text-[13px] text-emerald-700/80 dark:text-emerald-400/80">
                Chat ID: <span className="font-mono">{telegramStatus.telegramChatId}</span>
              </div>
              {telegramStatus.connectedAt && (
                <div className="mt-0.5 text-[12px] text-emerald-600/60 dark:text-emerald-400/50">
                  Connected {new Date(telegramStatus.connectedAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={handleSendTest}
                disabled={testMutation.isPending}
                className="rounded-full border border-emerald-300 dark:border-emerald-700 bg-white/80 dark:bg-white/5 px-4 py-2 text-[13px] font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors disabled:opacity-50"
              >
                {testMutation.isPending ? "Sending…" : "Send Test"}
              </button>
              <button
                type="button"
                onClick={handleDisconnect}
                disabled={disconnectMutation.isPending}
                className="rounded-full border border-rose-200 dark:border-rose-800 bg-white/80 dark:bg-white/5 px-4 py-2 text-[13px] font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors disabled:opacity-50"
              >
                {disconnectMutation.isPending ? "Disconnecting…" : "Disconnect"}
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur p-4">
          <div className="text-[13px] text-zinc-600 dark:text-zinc-300">
            💡 WAF attack alerts matching your filters will be sent to this Telegram chat automatically.
          </div>
        </div>
      </div>
    );
  }

  // ——— LINK GENERATED (waiting for user to connect in Telegram) ———
  if (linkData) {
    // Check if link is expired
    const isExpired = new Date(linkData.expiresAt) < new Date();

    return (
      <div className="space-y-4">
        {/* Step indicator */}
        <div className="flex items-center gap-2 text-[13px] text-zinc-500 dark:text-zinc-400">
          <div className="h-5 w-5 animate-pulse rounded-full bg-blue-500/20 flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
          </div>
          Waiting for you to connect in Telegram…
        </div>

        <div className="rounded-2xl border border-blue-200 dark:border-blue-800/50 bg-blue-50/30 dark:bg-blue-950/20 backdrop-blur p-5 space-y-4">
          {/* Deep link */}
          {linkData.deepLink && !isExpired && (
            <div>
              <div className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Step 1: Open this link in Telegram
              </div>
              <div className="flex items-stretch gap-2">
                <div className="flex-1 rounded-xl border border-blue-200 dark:border-blue-700/50 bg-white/80 dark:bg-white/5 px-4 py-3 text-[13px] font-mono text-blue-700 dark:text-blue-300 truncate select-all">
                  {linkData.deepLink}
                </div>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="rounded-xl border border-blue-200 dark:border-blue-700/50 bg-white/80 dark:bg-white/5 px-4 flex items-center gap-2 text-[13px] font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                >
                  {copied ? (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>
              <a
                href={linkData.deepLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#2AABEE] hover:bg-[#229ED9] text-white px-5 py-2.5 text-[13px] font-semibold transition-colors"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.13-.041-.186-.024c-.082.03-1.375.87-3.973 2.556-.376.2-.715.298-.996.29-.34-.01-.995-.192-1.48-.35-.765-.243-1.37-.375-1.32-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
                Open in Telegram
              </a>
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-blue-200 dark:bg-blue-700/50" />
            <span className="text-[12px] font-medium text-blue-400 dark:text-blue-500 uppercase tracking-wider">
              or connect manually
            </span>
            <div className="flex-1 h-px bg-blue-200 dark:bg-blue-700/50" />
          </div>

          {/* Manual connect instructions */}
          <div>
            <div className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300 mb-3">
              Manual Steps:
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[12px] font-bold">1</span>
                <div className="text-[13px] text-zinc-600 dark:text-zinc-400">
                  Open Telegram and search for <span className="font-semibold text-zinc-800 dark:text-zinc-200">{linkData.botUsername ? `@${linkData.botUsername}` : "the bot"}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[12px] font-bold">2</span>
                <div className="text-[13px] text-zinc-600 dark:text-zinc-400">
                  Press <span className="font-semibold text-zinc-800 dark:text-zinc-200">Start</span> or type <code className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 font-mono text-[12px] text-blue-700 dark:text-blue-300">/start</code>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[12px] font-bold">3</span>
                <div className="text-[13px] text-zinc-600 dark:text-zinc-400">
                  Send this message to the bot:
                </div>
              </div>
            </div>
            <div className="mt-2 ml-9 flex items-stretch gap-2">
              <div className="flex-1 rounded-xl border border-blue-200 dark:border-blue-700/50 bg-white/80 dark:bg-white/5 px-4 py-3 font-mono text-[14px] font-bold text-blue-700 dark:text-blue-300 select-all">
                /start {linkData.connectCode}
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`/start ${linkData.connectCode}`);
                  setCopied(true);
                  toast.success("Command copied!");
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="rounded-xl border border-blue-200 dark:border-blue-700/50 bg-white/80 dark:bg-white/5 px-4 flex items-center gap-2 text-[13px] font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </button>
            </div>
            <div className="mt-3 ml-9">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[12px] font-bold">✓</span>
                <div className="text-[13px] text-zinc-600 dark:text-zinc-400">
                  The bot will confirm the connection — this page will update automatically
                </div>
              </div>
            </div>
          </div>

          {/* Expiry */}
          <div className="text-[12px] text-zinc-500 dark:text-zinc-400">
            {isExpired ? (
              <span className="text-rose-500">⏰ This code has expired. Click &quot;Generate New Code&quot; below.</span>
            ) : (
              <>⏱ Code expires at {new Date(linkData.expiresAt).toLocaleTimeString()} (10 minutes)</>
            )}
          </div>
        </div>

        {/* Regenerate button */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleGenerateLink}
            disabled={startLinkMutation.isPending}
            className="rounded-full border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 px-5 py-2.5 text-[13px] font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            {startLinkMutation.isPending ? "Generating…" : "Generate New Code"}
          </button>
          <button
            type="button"
            onClick={() => setLinkData(null)}
            className="rounded-full border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 px-5 py-2.5 text-[13px] font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // ——— NOT CONNECTED — show Connect button ———
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur p-6 text-center">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-[#2AABEE]/10 flex items-center justify-center mb-4">
          <svg className="h-7 w-7 text-[#2AABEE]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.13-.041-.186-.024c-.082.03-1.375.87-3.973 2.556-.376.2-.715.298-.996.29-.34-.01-.995-.192-1.48-.35-.765-.243-1.37-.375-1.32-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
          </svg>
        </div>

        <h4 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
          Connect Telegram
        </h4>
        <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mb-5 max-w-sm mx-auto">
          Link your Telegram account to receive WAF attack alerts instantly in your chat.
        </p>

        <button
          type="button"
          onClick={handleGenerateLink}
          disabled={startLinkMutation.isPending || !organizationId}
          className="inline-flex items-center gap-2 rounded-full bg-[#2AABEE] hover:bg-[#229ED9] text-white px-6 py-3 text-[14px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.13-.041-.186-.024c-.082.03-1.375.87-3.973 2.556-.376.2-.715.298-.996.29-.34-.01-.995-.192-1.48-.35-.765-.243-1.37-.375-1.32-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
          </svg>
          {startLinkMutation.isPending ? "Generating Link…" : "Connect Telegram"}
        </button>
      </div>

      <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur p-4">
        <div className="text-[13px] text-zinc-600 dark:text-zinc-300">
          <span className="font-medium">How it works:</span> Click "Connect Telegram" to generate a secure link.
          Open the link in Telegram, tap <span className="font-medium">Start</span>,
          and your account will be linked automatically.
        </div>
      </div>
    </div>
  );
}

export function NotificationsSettings({ domains, organizationId }: NotificationsSettingsProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingSettingsId, setEditingSettingsId] = useState<string | null>(null);
  const [removingSettingsId, setRemovingSettingsId] = useState<string | null>(null);

  // Fetch notification settings from backend
  const {
    data: notificationSettingsData,
    isLoading: isLoadingSettings,
  } = useNotificationSettings(organizationId || undefined);

  const createMutation = useCreateNotificationSettings(organizationId || undefined);
  const updateMutation = useUpdateNotificationSettings(organizationId || undefined);
  const deleteMutation = useDeleteNotificationSettings(organizationId || undefined);
  const sendSampleMutation = useSendSampleNotification(organizationId || undefined);

  const savedSettings = notificationSettingsData?.settings || [];

  const [notificationType, setNotificationType] = useState<NotificationType>("email");
  const [emailList, setEmailList] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  const [domainFilter, setDomainFilter] = useState<DomainFilter>("all");
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");

  const canSendSample = useMemo(() => {
    if (notificationType === "email") return emailList.length > 0;
    return true; // Telegram sample is handled by the connect section
  }, [notificationType, emailList.length]);

  const handleAddEmail = () => {
    const value = newEmail.trim();
    if (!value) return toast.error("Please enter an email address");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return toast.error("Please enter a valid email address");
    if (emailList.includes(value)) return toast.error("This email is already in the list");

    setEmailList((prev) => [...prev, value]);
    setNewEmail("");
    toast.success("Email added successfully");
  };

  const handleRemoveEmail = (email: string) => {
    setEmailList((prev) => prev.filter((e) => e !== email));
    toast.success("Email removed");
  };

  const telegramTestMutation = useTelegramTest(organizationId || undefined);

  const handleSendSample = async () => {
    if (!organizationId) {
      toast.error("Organization ID is required");
      return;
    }

    try {
      if (notificationType === "email") {
        if (emailList.length === 0) {
          return toast.error("Please add at least one email address");
        }
        await sendSampleMutation.mutateAsync({
          notificationType: "email",
          emailList: emailList,
        });
      } else {
        // Telegram — send a sample WAF alert via the same send-sample endpoint
        await sendSampleMutation.mutateAsync({
          notificationType: "telegram",
        });
      }
    } catch {
      // Error is handled by the mutation hook
    }
  };

  const handleEdit = (settings: NotificationSettings) => {
    // Load saved settings into form
    setNotificationType(settings.notificationType);
    setEmailList(settings.emailList);
    setTelegramChatId(settings.telegramChatId || "");
    setDomainFilter(settings.domainFilter);
    setSelectedDomains(settings.selectedDomains);
    setSeverityFilter(settings.severityFilter);
    setEditingSettingsId(settings.id);
    setIsEditMode(true);
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setEditingSettingsId(null);
    // Reset to defaults
    setNotificationType("email");
    setEmailList([]);
    setTelegramChatId("");
    setDomainFilter("all");
    setSelectedDomains([]);
    setSeverityFilter("all");
  };

  const handleSave = async () => {
    if (!organizationId) {
      toast.error("Organization ID is required");
      return;
    }

    // Validate required fields
    if (notificationType === "email" && emailList.length === 0) {
      toast.error("Please add at least one email address");
      return;
    }

    // Telegram chat ID is set automatically via the connect flow, skip manual validation

    if (domainFilter === "specific" && selectedDomains.length === 0) {
      toast.error("Please select at least one domain");
      return;
    }

    const data = {
      notificationType,
      emailList: notificationType === "email" ? emailList : [],
      telegramChatId: undefined, // Chat ID is set via the Telegram connect flow
      domainFilter,
      selectedDomains: domainFilter === "specific" ? selectedDomains : [],
      severityFilter,
      enabled: true,
    };

    try {
      if (editingSettingsId) {
        // Update existing settings - wait for response
        await updateMutation.mutateAsync({
          settingsId: editingSettingsId,
          data,
        });
      } else {
        // Create new settings - wait for response
        await createMutation.mutateAsync(data);
      }
      // Only reset form and exit edit mode after successful response
      setIsEditMode(false);
      setEditingSettingsId(null);
      // Reset form
      setNotificationType("email");
      setEmailList([]);
      setTelegramChatId("");
      setDomainFilter("all");
      setSelectedDomains([]);
      setSeverityFilter("all");
    } catch (error) {
      // Error is handled by the mutation hook's onError callback
      // Don't reset form or exit edit mode on error
      console.error("Failed to save notification settings:", error);
    }
  };

  const handleRemove = async (settingsId: string) => {
    if (!organizationId) {
      toast.error("Organization ID is required");
      return;
    }

    setRemovingSettingsId(settingsId);
    try {
      // Wait for delete to complete before showing success
      await deleteMutation.mutateAsync(settingsId);
    } catch (error) {
      // Error is handled by the mutation hook's onError callback
      console.error("Failed to delete notification settings:", error);
    } finally {
      setRemovingSettingsId(null);
    }
  };

  const handleAddNew = () => {
    // Reset to defaults
    setNotificationType("email");
    setEmailList([]);
    setTelegramChatId("");
    setDomainFilter("all");
    setSelectedDomains([]);
    setSeverityFilter("all");
    setIsEditMode(true);
  };

  // Show loading state
  if (isLoadingSettings) {
    return (
      <div className="space-y-7">
        <div className="rounded-3xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl p-10 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-zinc-900/20 border-t-zinc-900 dark:border-white/20 dark:border-t-white" />
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            Loading notification settings...
          </p>
        </div>
      </div>
    );
  }

  // Show error if no organization
  if (!organizationId) {
    return (
      <div className="space-y-7">
        <div className="rounded-3xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl p-10 text-center">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            No organization found. Please ensure you are a member of an organization.
          </p>
        </div>
      </div>
    );
  }

  // Show summary if settings exist and not in edit mode
  if (savedSettings.length > 0 && !isEditMode) {
    return (
      <div className="space-y-7">
        {/* Header */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-[28px] font-semibold tracking-[-0.02em] text-zinc-900 dark:text-zinc-100">
              Notification Settings
            </h2>
            <p className="mt-1 text-[13px] text-zinc-500 dark:text-zinc-400">
              Configure how you receive WAF security alerts and summaries.
            </p>
          </div>
        </div>

        {/* Summary List */}
        <div className="space-y-4">
          {savedSettings.map((setting) => (
            <NotificationSummary
              key={setting.id}
              settings={setting}
              onEdit={() => handleEdit(setting)}
              onRemove={() => handleRemove(setting.id)}
              isRemoving={removingSettingsId === setting.id}
            />
          ))}
        </div>

        {/* Add Another Button */}
        <div className="flex justify-end">
          <Button onClick={handleAddNew} variant="outline" size="md">
            Add Another Notification
          </Button>
        </div>

        {/* Info Footer */}
        <div className="rounded-3xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-9 w-9 rounded-2xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur flex items-center justify-center">
              <svg className="h-5 w-5 text-zinc-900 dark:text-zinc-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <div className="text-[12px] leading-5 text-zinc-500 dark:text-zinc-400">
              <div className="font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                About Notifications
              </div>
              Configure how you want to receive WAF security alerts and summaries. You can filter by domain and severity,
              and test delivery using "Send Sample".
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show add button if no settings exist and not in edit mode
  if (savedSettings.length === 0 && !isEditMode) {
    return (
      <div className="space-y-7">
        {/* Header */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-[28px] font-semibold tracking-[-0.02em] text-zinc-900 dark:text-zinc-100">
              Notification Settings
            </h2>
            <p className="mt-1 text-[13px] text-zinc-500 dark:text-zinc-400">
              Configure how you receive WAF security alerts and summaries.
            </p>
          </div>
        </div>

        {/* Empty State */}
        <div className="rounded-3xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl shadow-[0_1px_0_rgba(0,0,0,0.04)] p-12">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 rounded-2xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <h3 className="text-[18px] font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              No notifications configured
            </h3>
            <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mb-6">
              Set up notifications to receive WAF security alerts and summaries.
            </p>
            <Button onClick={handleAddNew} variant="primary" size="md">
              Add Notification
            </Button>
          </div>
        </div>

        {/* Info Footer */}
        <div className="rounded-3xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-9 w-9 rounded-2xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur flex items-center justify-center">
              <svg className="h-5 w-5 text-zinc-900 dark:text-zinc-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <div className="text-[12px] leading-5 text-zinc-500 dark:text-zinc-400">
              <div className="font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                About Notifications
              </div>
              Configure how you want to receive WAF security alerts and summaries. You can filter by domain and severity,
              and test delivery using "Send Sample".
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Edit mode - show all forms
  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-[28px] font-semibold tracking-[-0.02em] text-zinc-900 dark:text-zinc-100">
            {editingSettingsId ? "Edit Notification Settings" : "Add Notification Settings"}
          </h2>
          <p className="mt-1 text-[13px] text-zinc-500 dark:text-zinc-400">
            Configure how you receive WAF security alerts and summaries.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <div className="rounded-full border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur px-3 py-1.5 text-[12px] text-zinc-600 dark:text-zinc-300">
            Channel: <span className="font-medium text-zinc-900 dark:text-zinc-100">{notificationType}</span>
          </div>
          <div className="rounded-full border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur px-3 py-1.5 text-[12px] text-zinc-600 dark:text-zinc-300">
            Severity: <span className="font-medium text-zinc-900 dark:text-zinc-100">{severityFilter}</span>
          </div>
        </div>
      </div>

      {/* Channels - Only show in edit mode */}
      <Section
        title="Notification Channels"
        description="Pick one channel for alerts. (You can later extend this to multi-channel.)"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <TileButton
            active={notificationType === "email"}
            title="Email"
            subtitle="Receive notifications via email."
            tint="zinc"
            onClick={() => setNotificationType("email")}
            icon={
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            }
          />
          <TileButton
            active={notificationType === "telegram"}
            title="Telegram"
            subtitle="Receive notifications in Telegram."
            tint="zinc"
            onClick={() => setNotificationType("telegram")}
            icon={
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.13-.041-.186-.024c-.082.03-1.375.87-3.973 2.556-.376.2-.715.298-.996.29-.34-.01-.995-.192-1.48-.35-.765-.243-1.37-.375-1.32-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
            }
          />
        </div>
      </Section>

      {/* Filters */}
      <Section
        title="Notification Filters"
        description="Control which domains and what severity levels trigger alerts."
      >
        <div className="space-y-6">
          {/* Domains */}
          <div className="space-y-3">
            <div className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300">
              Domains
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <RadioPill
                active={domainFilter === "all"}
                title="All Domains"
                subtitle="Receive notifications for every domain."
                onSelect={() => {
                  setDomainFilter("all");
                  setSelectedDomains([]);
                }}
              />
              <RadioPill
                active={domainFilter === "specific"}
                title="Specific Domains"
                subtitle="Choose which domains to receive notifications for."
                onSelect={() => setDomainFilter("specific")}
              />
            </div>

            {domainFilter === "specific" && domains.length > 0 && (
              <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {domains.map((domain) => {
                    const checked = selectedDomains.includes(domain);
                    return (
                      <button
                        key={domain}
                        type="button"
                        onClick={() => {
                          setSelectedDomains((prev) =>
                            prev.includes(domain)
                              ? prev.filter((d) => d !== domain)
                              : [...prev, domain]
                          );
                        }}
                        className={[
                          "rounded-2xl border px-3 py-3 text-left transition-all",
                          "bg-white/70 dark:bg-white/5 backdrop-blur",
                          checked
                            ? "border-zinc-900/20 dark:border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
                            : "border-black/5 dark:border-white/10 hover:border-zinc-900/15 dark:hover:border-white/15",
                        ].join(" ")}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={[
                              "h-5 w-5 rounded-md border flex items-center justify-center",
                              checked
                                ? "border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100"
                                : "border-zinc-300 dark:border-zinc-600",
                            ].join(" ")}
                            aria-hidden="true"
                          >
                            <svg
                              className={[
                                "h-3.5 w-3.5",
                                checked ? "text-white dark:text-zinc-900" : "text-transparent",
                              ].join(" ")}
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.704 5.29a1 1 0 010 1.42l-7.4 7.4a1 1 0 01-1.42 0l-3.3-3.3a1 1 0 011.42-1.42l2.59 2.59 6.69-6.69a1 1 0 011.42 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>

                          <span className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100 font-mono">
                            {domain}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Severity */}
          <div className="space-y-3">
            <div className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300">
              Severity Level
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <ChoiceChip
                active={severityFilter === "all"}
                label="All"
                caption="All severities"
                tone="neutral"
                onSelect={() => setSeverityFilter("all")}
              />
              <ChoiceChip
                active={severityFilter === "critical"}
                label="Critical"
                caption="Critical only"
                tone="critical"
                onSelect={() => setSeverityFilter("critical")}
              />
              <ChoiceChip
                active={severityFilter === "high"}
                label="High"
                caption="High only"
                tone="high"
                onSelect={() => setSeverityFilter("high")}
              />
              <ChoiceChip
                active={severityFilter === "low"}
                label="Low"
                caption="Low only"
                tone="low"
                onSelect={() => setSeverityFilter("low")}
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Configuration */}
      <Section
        title={
          notificationType === "email"
            ? "Email Configuration"
            : "Telegram Configuration"
        }
        description="Set destination details and test delivery."
        right={
          <Button
            onClick={handleSendSample}
            variant="outline"
            size="sm"
            disabled={sendSampleMutation.isPending}
            className="flex items-center gap-2"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
            <span>{sendSampleMutation.isPending ? "Sending..." : "Send Sample"}</span>
          </Button>
        }
      >
        {notificationType === "email" && (
          <div className="space-y-4">
            <div className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300">
              Email Addresses
            </div>

            <div className="flex gap-2 items-stretch max-w-xl">
              <Input
                type="email"
                placeholder="Enter email address…"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddEmail();
                }}
                className={[
                  "flex-1 rounded-2xl",
                  "bg-white/70 dark:bg-white/5 backdrop-blur-xl",
                  "border border-black/5 dark:border-white/10",
                  "focus:ring-2 focus:ring-zinc-900/15 dark:focus:ring-white/15",
                ].join(" ")}
              />
              <Button onClick={handleAddEmail} variant="primary" size="md" className="px-8 h-[48px]">
                Add
              </Button>
            </div>

            {emailList.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {emailList.map((email) => (
                  <Tag key={email} text={email} onRemove={() => handleRemoveEmail(email)} />
                ))}
              </div>
            )}
          </div>
        )}

        {notificationType === "telegram" && (
          <TelegramConnectSection organizationId={organizationId} />
        )}
      </Section>

      {/* Save/Cancel */}
      <div className="flex justify-end gap-3">
        <Button
          onClick={handleCancel}
          variant="outline"
          size="md"
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="primary"
          size="md"
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          {createMutation.isPending || updateMutation.isPending
            ? "Saving..."
            : "Save Settings"}
        </Button>
      </div>

      {/* Info Footer */}
      <div className="rounded-3xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl p-5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 h-9 w-9 rounded-2xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur flex items-center justify-center">
            <svg className="h-5 w-5 text-zinc-900 dark:text-zinc-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <div className="text-[12px] leading-5 text-zinc-500 dark:text-zinc-400">
            <div className="font-medium text-zinc-900 dark:text-zinc-100 mb-1">
              About Notifications
            </div>
            Configure how you want to receive WAF security alerts and summaries. You can filter by domain and severity,
            and test delivery using “Send Sample”.
          </div>
        </div>
      </div>
    </div>
  );
}
