"use client";

import { useState, useEffect } from "react";
import {
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  CARD_CLASS,
  INPUT_CLASS,
} from "@/components/dashboard/dashboardUi";

type UserRole = "admin" | "viewer";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (user: { email: string; role: string }) => void;
  existingEmails: string[];
  canAddAdmin: boolean;
  isLoading?: boolean;
}

const ROLES: Array<{ value: UserRole; title: string; description: string }> = [
  { value: "viewer", title: "Viewer", description: "Read-only access to the dashboard and logs" },
  { value: "admin", title: "Admin", description: "Full access to all features and settings" },
];

/** The dialog mounts only while open, so its fields start empty every time. */
export function AddUserModal(props: AddUserModalProps) {
  if (!props.isOpen) return null;
  return <InviteDialog {...props} />;
}

function InviteDialog({
  onClose,
  onAdd,
  existingEmails,
  canAddAdmin: canAddAdminProp,
  isLoading = false,
}: AddUserModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("viewer");
  const [errors, setErrors] = useState<{ email?: string; role?: string }>({});

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isLoading) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isLoading, onClose]);

  const validateEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email.trim())) {
      newErrors.email = "Enter a valid email address";
    } else if (existingEmails.some((existing) => existing.toLowerCase() === email.trim().toLowerCase())) {
      newErrors.email = "This person is already a member";
    }

    if (role === "admin" && !canAddAdminProp) {
      newErrors.role = "All 3 admin seats are in use";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onAdd({ email: email.trim().toLowerCase(), role });
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[50] bg-black/40 backdrop-blur-[2px]"
        onClick={isLoading ? undefined : onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="invite-user-title"
          className={`${CARD_CLASS} animate-scale-in w-full max-w-md shadow-2xl`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4 dark:border-white/[0.06]">
            <div>
              <h2 id="invite-user-title" className="text-[15px] font-semibold text-gray-900 dark:text-white">
                Invite a team member
              </h2>
              <p className="mt-0.5 text-[13px] text-gray-500 dark:text-gray-400">
                They will get an email with a link to join.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed dark:text-gray-400 dark:hover:bg-white/[0.06] dark:hover:text-white"
              aria-label="Close"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-5 px-5 py-5">
              <div>
                <label htmlFor="invite-email" className="mb-1.5 block text-[13px] font-medium text-gray-700 dark:text-gray-300">
                  Email address
                </label>
                <input
                  id="invite-email"
                  type="email"
                  autoFocus
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  placeholder="name@company.com"
                  aria-invalid={Boolean(errors.email)}
                  className={`${INPUT_CLASS} ${errors.email ? "border-red-400 dark:border-red-500/70" : ""}`}
                />
                {errors.email ? (
                  <p className="mt-1.5 text-[12px] text-red-600 dark:text-red-400">{errors.email}</p>
                ) : null}
              </div>

              <fieldset>
                <legend className="mb-1.5 block text-[13px] font-medium text-gray-700 dark:text-gray-300">
                  Role
                </legend>
                <div className="grid gap-2">
                  {ROLES.map((option) => {
                    const disabled = option.value === "admin" && !canAddAdminProp;
                    const selected = role === option.value;
                    return (
                      <label
                        key={option.value}
                        className={[
                          "flex items-start gap-3 rounded-xl border p-3 transition-colors",
                          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
                          selected
                            ? "border-gray-900 bg-gray-50 dark:border-white/60 dark:bg-white/[0.04]"
                            : "border-gray-200 hover:border-gray-300 dark:border-white/10 dark:hover:border-white/20",
                        ].join(" ")}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={option.value}
                          checked={selected}
                          disabled={disabled}
                          onChange={() => {
                            setRole(option.value);
                            if (errors.role) setErrors({ ...errors, role: undefined });
                          }}
                          className="mt-0.5 h-4 w-4 accent-gray-900 dark:accent-white"
                        />
                        <span className="min-w-0">
                          <span className="flex items-center gap-2 text-[13px] font-medium text-gray-900 dark:text-white">
                            {option.title}
                            {disabled ? (
                              <span className="text-[11px] font-normal text-gray-500 dark:text-gray-400">
                                All 3 seats in use
                              </span>
                            ) : null}
                          </span>
                          <span className="mt-0.5 block text-[12px] text-gray-500 dark:text-gray-400">
                            {option.description}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
                {errors.role ? (
                  <p className="mt-1.5 text-[12px] text-red-600 dark:text-red-400">{errors.role}</p>
                ) : null}
              </fieldset>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-4 dark:border-white/[0.06]">
              <button type="button" onClick={onClose} disabled={isLoading} className={BUTTON_SECONDARY}>
                Cancel
              </button>
              <button type="submit" disabled={isLoading} className={BUTTON_PRIMARY}>
                {isLoading ? "Sending invite…" : "Send invite"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          from {
            transform: scale(0.97);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.15s ease-out;
        }
      `}</style>
    </>
  );
}
