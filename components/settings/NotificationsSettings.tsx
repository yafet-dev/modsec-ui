"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type NotificationType = "email" | "telegram" | "whatsapp";
type SeverityFilter = "all" | "critical" | "high" | "low";
type DomainFilter = "all" | "specific";

interface NotificationsSettingsProps {
  domains: string[];
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
}: {
  settings: SavedNotificationSettings;
  onEdit: () => void;
  onRemove: () => void;
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
    } else if (settings.notificationType === "telegram") {
      return (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.13-.041-.186-.024c-.082.03-1.375.87-3.973 2.556-.376.2-.715.298-.996.29-.34-.01-.995-.192-1.48-.35-.765-.243-1.37-.375-1.32-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      );
    } else {
      return (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
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
    } else if (settings.notificationType === "telegram") {
      return settings.telegramChatId || "Not configured";
    } else {
      return settings.whatsappNumber || "Not configured";
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
            <Button onClick={onEdit} variant="outline" size="sm">
              Edit
            </Button>
            <Button onClick={onRemove} variant="outline" size="sm" className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300">
              Remove
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SavedNotificationSettings {
  notificationType: NotificationType;
  emailList: string[];
  telegramChatId: string;
  whatsappNumber: string;
  domainFilter: DomainFilter;
  selectedDomains: string[];
  severityFilter: SeverityFilter;
}

export function NotificationsSettings({ domains }: NotificationsSettingsProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [savedSettings, setSavedSettings] = useState<SavedNotificationSettings | null>(null);

  const [notificationType, setNotificationType] = useState<NotificationType>("email");
  const [emailList, setEmailList] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [domainFilter, setDomainFilter] = useState<DomainFilter>("all");
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");

  const canSendSample = useMemo(() => {
    if (notificationType === "email") return emailList.length > 0;
    if (notificationType === "telegram") return telegramChatId.trim().length > 0;
    return whatsappNumber.trim().length > 0;
  }, [notificationType, emailList.length, telegramChatId, whatsappNumber]);

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

  const handleSendSample = async () => {
    if (!canSendSample) {
      if (notificationType === "email") return toast.error("Please add at least one email address");
      if (notificationType === "telegram") return toast.error("Please enter a Telegram chat ID");
      return toast.error("Please enter a WhatsApp number");
    }

    if (notificationType === "email") {
      toast.success(`Sample email sent to ${emailList.length} recipient(s)`);
    } else if (notificationType === "telegram") {
      toast.success("Sample Telegram message sent");
    } else {
      toast.success("Sample WhatsApp message sent");
    }
  };

  const handleEdit = () => {
    if (savedSettings) {
      // Load saved settings into form
      setNotificationType(savedSettings.notificationType);
      setEmailList(savedSettings.emailList);
      setTelegramChatId(savedSettings.telegramChatId);
      setWhatsappNumber(savedSettings.whatsappNumber);
      setDomainFilter(savedSettings.domainFilter);
      setSelectedDomains(savedSettings.selectedDomains);
      setSeverityFilter(savedSettings.severityFilter);
    }
    setIsEditMode(true);
  };

  const handleCancel = () => {
    setIsEditMode(false);
    // Reset to saved settings or defaults
    if (savedSettings) {
      setNotificationType(savedSettings.notificationType);
      setEmailList(savedSettings.emailList);
      setTelegramChatId(savedSettings.telegramChatId);
      setWhatsappNumber(savedSettings.whatsappNumber);
      setDomainFilter(savedSettings.domainFilter);
      setSelectedDomains(savedSettings.selectedDomains);
      setSeverityFilter(savedSettings.severityFilter);
    } else {
      // Reset to defaults
      setNotificationType("email");
      setEmailList([]);
      setTelegramChatId("");
      setWhatsappNumber("");
      setDomainFilter("all");
      setSelectedDomains([]);
      setSeverityFilter("all");
    }
  };

  const handleSave = () => {
    const settings: SavedNotificationSettings = {
      notificationType,
      emailList,
      telegramChatId,
      whatsappNumber,
      domainFilter,
      selectedDomains,
      severityFilter,
    };
    setSavedSettings(settings);
    setIsEditMode(false);
    toast.success("Notification settings saved successfully");
  };

  const handleRemove = () => {
    setSavedSettings(null);
    setIsEditMode(false);
    // Reset to defaults
    setNotificationType("email");
    setEmailList([]);
    setTelegramChatId("");
    setWhatsappNumber("");
    setDomainFilter("all");
    setSelectedDomains([]);
    setSeverityFilter("all");
    toast.success("Notification settings removed");
  };

  const handleAddNew = () => {
    // Reset to defaults
    setNotificationType("email");
    setEmailList([]);
    setTelegramChatId("");
    setWhatsappNumber("");
    setDomainFilter("all");
    setSelectedDomains([]);
    setSeverityFilter("all");
    setIsEditMode(true);
  };

  // Show summary if settings exist and not in edit mode
  if (savedSettings && !isEditMode) {
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

        {/* Summary */}
        <NotificationSummary
          settings={savedSettings}
          onEdit={handleEdit}
          onRemove={handleRemove}
        />

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
  if (!savedSettings && !isEditMode) {
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
            {savedSettings ? "Edit Notification Settings" : "Add Notification Settings"}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
          <TileButton
            active={notificationType === "whatsapp"}
            title="WhatsApp"
            subtitle="Receive notifications via WhatsApp."
            tint="green"
            onClick={() => setNotificationType("whatsapp")}
            icon={
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
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
            : notificationType === "telegram"
            ? "Telegram Configuration"
            : "WhatsApp Configuration"
        }
        description="Set destination details and test delivery."
        right={
          <Button
            onClick={handleSendSample}
            variant="outline"
            size="sm"
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
            <span>Send Sample</span>
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
          <div className="space-y-3 max-w-xl">
            <Input
              label="Telegram Chat ID"
              type="text"
              placeholder="Enter your Telegram chat ID…"
              value={telegramChatId}
              onChange={(e) => setTelegramChatId(e.target.value)}
              className={[
                "rounded-2xl",
                "bg-white/70 dark:bg-white/5 backdrop-blur-xl",
                "border border-black/5 dark:border-white/10",
                "focus:ring-2 focus:ring-zinc-900/15 dark:focus:ring-white/15",
              ].join(" ")}
            />
            <p className="text-[12px] leading-5 text-zinc-500 dark:text-zinc-400">
              To get your chat ID, start a conversation with @BotFather on Telegram.
            </p>
          </div>
        )}

        {notificationType === "whatsapp" && (
          <div className="space-y-3 max-w-xl">
            <Input
              label="WhatsApp Number"
              type="tel"
              placeholder="+1234567890"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              className={[
                "rounded-2xl",
                "bg-white/70 dark:bg-white/5 backdrop-blur-xl",
                "border border-black/5 dark:border-white/10",
                "focus:ring-2 focus:ring-zinc-900/15 dark:focus:ring-white/15",
              ].join(" ")}
            />
            <p className="text-[12px] leading-5 text-zinc-500 dark:text-zinc-400">
              Use international format (example: +1234567890).
            </p>
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur p-4">
          <div className="text-[13px] text-zinc-600 dark:text-zinc-300">
            Tip: Keep your test message short and include the domain + severity so delivery issues are easier to debug.
          </div>
        </div>
      </Section>

      {/* Save/Cancel */}
      <div className="flex justify-end gap-3">
        <Button onClick={handleCancel} variant="outline" size="md">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="primary" size="md">
          Save Settings
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
