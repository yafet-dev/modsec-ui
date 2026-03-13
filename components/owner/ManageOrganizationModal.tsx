"use client";

import { useState, useEffect } from "react";
import { type Organization } from "@/data/organizations";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DomainWAFSection } from "./DomainWAFSection";

interface ManageOrganizationModalProps {
  isOpen: boolean;
  organization: Organization | null;
  onClose: () => void;
  onUpdate: (org: Organization) => void;
  onDelete: (orgId: string) => void;
  onToggleStatus: (orgId: string) => void;
}

export function ManageOrganizationModal({
  isOpen,
  organization,
  onClose,
  onUpdate,
  onDelete,
  onToggleStatus,
}: ManageOrganizationModalProps) {
  const [name, setName] = useState("");
  const [domains, setDomains] = useState<string[]>([]);
  const [newDomain, setNewDomain] = useState("");
  const [errors, setErrors] = useState<{ name?: string; domain?: string }>({});

  useEffect(() => {
    if (organization) {
      setName(organization.name);
      setDomains([...organization.domains]);
      setNewDomain("");
      setErrors({});
    }
  }, [organization, isOpen]);

  const validateDomain = (domain: string): boolean => {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
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
      setErrors({ domain: "Domain already exists" });
      return;
    }

    setDomains([...domains, domain]);
    setNewDomain("");
    setErrors({});
  };

  const handleRemoveDomain = (domainToRemove: string) => {
    if (domains.length === 1) {
      setErrors({ domain: "Organization must have at least one domain" });
      return;
    }
    setDomains(domains.filter((d) => d !== domainToRemove));
    setErrors({});
  };

  const handleSave = () => {
    if (!organization) return;

    if (!name.trim()) {
      setErrors({ name: "Organization name is required" });
      return;
    }

    const updatedOrg: Organization = {
      ...organization,
      name: name.trim(),
      domains: domains,
    };

    onUpdate(updatedOrg);
  };

  const handleDelete = () => {
    if (!organization) return;
    if (
      confirm(
        `Are you sure you want to delete "${organization.name}"? This action cannot be undone and will affect all associated users.`
      )
    ) {
      onDelete(organization.id);
      onClose();
    }
  };

  const handleToggleStatus = () => {
    if (!organization) return;
    onToggleStatus(organization.id);
  };

  if (!isOpen || !organization) return null;

  const isDisabled = organization.status === "disabled";

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-[50] transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200 dark:border-gray-800 animate-scale-in max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Manage Organization
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {organization.name}
              </p>
            </div>
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

          {/* Content */}
          <div className="px-6 py-4 space-y-6">
            {/* Organization Name */}
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

            {/* Domains */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Domains
              </label>
              <div className="space-y-3">
                {/* Existing domains */}
                <div className="flex flex-wrap gap-2">
                  {domains.map((domain, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg"
                    >
                      <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
                        {domain}
                      </span>
                      {domains.length > 1 && (
                        <button
                          onClick={() => handleRemoveDomain(domain)}
                          className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add domain input */}
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={newDomain}
                    onChange={(e) => {
                      setNewDomain(e.target.value);
                      if (errors.domain) setErrors({ ...errors, domain: undefined });
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
                    Add Domain
                  </Button>
                </div>
                {errors.domain && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {errors.domain}
                  </p>
                )}
              </div>
            </div>

            {/* WAF Protection Section */}
            <div>
              <DomainWAFSection
                organizationId={organization.id}
                domains={domains}
              />
            </div>

            {/* Status Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Organization Status
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {isDisabled
                    ? "Disabled organizations cannot access the system"
                    : "Organization is active and operational"}
                </p>
              </div>
              <button
                onClick={handleToggleStatus}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDisabled
                    ? "bg-gray-300 dark:bg-gray-700"
                    : "bg-green-500"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isDisabled ? "translate-x-0" : "translate-x-5"
                  }`}
                />
              </button>
            </div>

            {/* Danger Zone */}
            <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">
                    Delete Organization
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Permanently delete this organization and all associated data
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={handleDelete}
                  variant="outline"
                  className="border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave}>
              Save Changes
            </Button>
          </div>
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

