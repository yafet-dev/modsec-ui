"use client";

import { useEffect } from "react";
import { Button } from "./Button";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "info",
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  // ESC to close (Apple-like)
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") onConfirm();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onCancel, onConfirm]);

  if (!isOpen) return null;

  const variants = {
    danger: {
      ring: "ring-rose-500/15 dark:ring-rose-400/15",
      badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/15 dark:border-rose-400/15",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
      primary:
        "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white",
      primaryFocus: "focus-visible:ring-2 focus-visible:ring-rose-500/30 dark:focus-visible:ring-rose-400/30",
    },
    warning: {
      ring: "ring-amber-500/15 dark:ring-amber-400/15",
      badge:
        "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/15 dark:border-amber-400/15",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
      primary:
        "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white",
      primaryFocus: "focus-visible:ring-2 focus-visible:ring-amber-500/30 dark:focus-visible:ring-amber-400/30",
    },
    info: {
      ring: "ring-zinc-900/10 dark:ring-white/10",
      badge:
        "bg-zinc-900/5 text-zinc-700 dark:text-zinc-200 border-zinc-900/10 dark:border-white/10",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      primary:
        "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white",
      primaryFocus: "focus-visible:ring-2 focus-visible:ring-zinc-900/20 dark:focus-visible:ring-white/20",
    },
  } as const;

  const v = variants[variant];

  return (
    <div
      className={[
        "fixed inset-0 z-[60] flex items-center justify-center p-4",
        "bg-black/35 dark:bg-black/55",
        "backdrop-blur-md",
      ].join(" ")}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-message"
    >
      <div
        className={[
          "w-full max-w-md",
          "rounded-[28px]",
          "border border-black/5 dark:border-white/10",
          "bg-white/75 dark:bg-white/6",
          "backdrop-blur-xl",
          "shadow-[0_30px_80px_rgba(0,0,0,0.25)]",
          "ring-1",
          v.ring,
        ].join(" ")}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div
              className={[
                "mt-0.5 h-10 w-10 rounded-2xl",
                "border",
                "flex items-center justify-center",
                "backdrop-blur",
                v.badge,
              ].join(" ")}
              aria-hidden="true"
            >
              {v.icon}
            </div>

            <div className="flex-1">
              <h3
                id="confirm-title"
                className="text-[17px] font-semibold tracking-[-0.01em] text-zinc-900 dark:text-zinc-100"
              >
                {title}
              </h3>
              <p
                id="confirm-message"
                className="mt-1 text-[13px] leading-5 text-zinc-500 dark:text-zinc-400"
              >
                {message}
              </p>
            </div>

            <button
              type="button"
              onClick={onCancel}
              className={[
                "shrink-0 rounded-full p-2",
                "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200",
                "hover:bg-black/5 dark:hover:bg-white/8",
                "transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20 dark:focus-visible:ring-white/20",
              ].join(" ")}
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
            <Button onClick={onCancel} variant="outline" size="md" className="rounded-full">
              {cancelText}
            </Button>

            <button
              type="button"
              onClick={onConfirm}
              className={[
                "rounded-full px-6 py-3 text-[14px] font-semibold tracking-[-0.01em]",
                "transition-all",
                v.primary,
                v.primaryFocus,
                "focus-visible:outline-none",
              ].join(" ")}
            >
              {confirmText}
            </button>
          </div>

          {/* Subtle hint row (optional but Apple-like) */}
          <div className="mt-4 text-[11px] text-zinc-400 dark:text-zinc-500 flex items-center justify-end gap-2">
            <span>ESC to close</span>
            <span className="h-1 w-1 rounded-full bg-zinc-300/70 dark:bg-zinc-600/70" />
            <span>⌘/Ctrl + Enter to confirm</span>
          </div>
        </div>
      </div>
    </div>
  );
}
