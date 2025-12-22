"use client";

import { useState, useEffect } from "react";
import { type Severity } from "@/data/rules";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface AddCustomRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description: string;
    severity: Severity;
    category: string;
    ruleContent: string;
  }) => void;
  isLoading?: boolean;
}

const severityOptions: { value: Severity; label: string }[] = [
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const categoryOptions = [
  "Injection",
  "XSS",
  "File Access",
  "Protocol",
  "Rate Limiting",
  "Geo",
  "Bot",
  "CSRF",
  "Session",
  "Upload",
  "Validation",
  "Cookie",
  "Data",
  "Authentication",
  "Limit",
  "Other",
];

export function AddCustomRuleModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: AddCustomRuleModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<Severity>("medium");
  const [category, setCategory] = useState("");
  const [ruleContent, setRuleContent] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
    category?: string;
    ruleContent?: string;
  }>({});

  useEffect(() => {
    if (!isOpen) {
      setName("");
      setDescription("");
      setSeverity("medium");
      setCategory("");
      setRuleContent("");
      setErrors({});
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = "Rule name is required";
    }

    if (!description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!category.trim()) {
      newErrors.category = "Category is required";
    }

    if (!ruleContent.trim()) {
      newErrors.ruleContent = "Rule content is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      severity,
      category: category.trim(),
      ruleContent: ruleContent.trim(),
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200 dark:border-gray-800 animate-scale-in max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900 z-10">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Add Custom Rule
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
                Rule Name *
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                placeholder="e.g., Custom SQL Injection Detection"
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
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description)
                    setErrors({ ...errors, description: undefined });
                }}
                placeholder="Describe what this rule detects or prevents"
                rows={3}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.description
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-700"
                } bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500`}
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Severity *
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as Severity)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all duration-200"
                >
                  {severityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    if (errors.category)
                      setErrors({ ...errors, category: undefined });
                  }}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.category
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-700"
                  } bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all duration-200`}
                >
                  <option value="">Select a category</option>
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors.category}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rule Content *{" "}
                <span className="text-xs text-gray-500">
                  (ModSecurity rule syntax)
                </span>
              </label>
              <textarea
                value={ruleContent}
                onChange={(e) => {
                  setRuleContent(e.target.value);
                  if (errors.ruleContent)
                    setErrors({ ...errors, ruleContent: undefined });
                }}
                placeholder='e.g., SecRule ARGS "@rx (?i)(union|select|insert|delete|update|drop|create|alter|exec|execute)" "id:1000001,phase:2,deny,status:403,msg:SQL Injection Attempt"'
                rows={6}
                className={`w-full px-4 py-3 rounded-lg border font-mono text-sm ${
                  errors.ruleContent
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-700"
                } bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500`}
              />
              {errors.ruleContent && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.ruleContent}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Enter the ModSecurity rule in the standard format. This rule
                will require super_admin approval before being enabled.
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Note:</strong> This custom rule will be submitted for
                review. A super_admin must approve it before it can be enabled.
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
                {isLoading ? "Submitting..." : "Submit Rule"}
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
