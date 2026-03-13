"use client";

import { useState, useEffect } from "react";
import { type Organization } from "@/data/organizations";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface AddOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (org: { name: string; domains: string[]; adminEmail: string }) => void;
  isLoading?: boolean;
}

export function AddOrganizationModal({
  isOpen,
  onClose,
  onAdd,
  isLoading = false,
}: AddOrganizationModalProps) {
  const [name, setName] = useState("");
  const [domains, setDomains] = useState<string[]>([]);
  const [newDomain, setNewDomain] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    domain?: string;
    adminEmail?: string;
  }>({});

  useEffect(() => {
    if (!isOpen) {
      setName("");
      setDomains([]);
      setNewDomain("");
      setAdminEmail("");
      setErrors({});
    }
  }, [isOpen]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateDomain = (domain: string): boolean => {
    // Allow subdomains: matches api.example.com, sub.api.example.com, etc.
    // Pattern: one or more domain segments (alphanumeric and hyphens), followed by TLD
    const domainRegex =
      /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
  };

  const handleAddDomain = () => {
    if (!newDomain.trim()) return;

    const domain = newDomain.trim().toLowerCase();
    if (!validateDomain(domain)) {
      setErrors({ domain: "Invalid domain format" });
      return;
    }

    if (domains.includes(domain)) {
      setErrors({ domain: "Domain already added" });
      return;
    }

    setDomains([...domains, domain]);
    setNewDomain("");
    setErrors({});
  };

  const handleRemoveDomain = (domainToRemove: string) => {
    setDomains(domains.filter((d) => d !== domainToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = "Organization name is required";
    }

    if (domains.length === 0) {
      newErrors.domain = "At least one domain is required";
    }

    if (!adminEmail.trim()) {
      newErrors.adminEmail = "Admin email is required";
    } else if (!validateEmail(adminEmail)) {
      newErrors.adminEmail = "Invalid email format";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onAdd({
      name: name.trim(),
      domains: domains,
      adminEmail: adminEmail.trim().toLowerCase(),
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-[50] transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-800 animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Add Organization
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-500 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Organization Name
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                placeholder="Acme Corporation"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Domains
              </label>
              <div className="space-y-3">
                {domains.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {domains.map((domain, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg"
                      >
                        <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
                          {domain}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveDomain(domain)}
                          className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={newDomain}
                    onChange={(e) => {
                      setNewDomain(e.target.value);
                      if (errors.domain)
                        setErrors({ ...errors, domain: undefined });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddDomain();
                      }
                    }}
                    placeholder="example.com"
                    className={errors.domain ? "border-red-500" : ""}
                  />
                  <Button
                    type="button"
                    onClick={handleAddDomain}
                    variant="outline"
                  >
                    Add
                  </Button>
                </div>
                {errors.domain && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {errors.domain}
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Add multiple domains for this organization
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Admin Email
              </label>
              <Input
                type="email"
                value={adminEmail}
                onChange={(e) => {
                  setAdminEmail(e.target.value);
                  if (errors.adminEmail)
                    setErrors({ ...errors, adminEmail: undefined });
                }}
                placeholder="admin@example.com"
                className={errors.adminEmail ? "border-red-500" : ""}
              />
              {errors.adminEmail && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.adminEmail}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                An invitation will be sent to this email. The first to accept
                becomes the admin.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Organization"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </>
  );
}
