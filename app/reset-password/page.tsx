"use client";

import { useState } from "react";
import { isAxiosError } from "axios";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useResetPassword } from "@/lib/api/hooks/useAuth";
import { useEmailActionToken } from "@/lib/hooks/useEmailActionToken";

function getErrorMessage(error: unknown): string {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || "Failed to reset password";
  }
  return "Failed to reset password";
}

function ResetPasswordContent() {
  const token = useEmailActionToken();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  const resetPassword = useResetPassword();

  const validatePassword = (): boolean => {
    const errors: { password?: string; confirmPassword?: string } = {};

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validatePassword()) {
      return;
    }

    if (!token) {
      setError("Invalid reset link. Please use the link from your email.");
      return;
    }

    resetPassword.mutate({ password, token });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-semibold mb-2 text-gray-900 dark:text-white">
            Reset Password
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Enter your new password
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="password"
              label="New Password"
              placeholder="Enter your new password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordErrors({ ...passwordErrors, password: undefined });
              }}
              required
              error={passwordErrors.password}
            />

            <Input
              type="password"
              label="Confirm New Password"
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setPasswordErrors({
                  ...passwordErrors,
                  confirmPassword: undefined,
                });
              }}
              required
              error={passwordErrors.confirmPassword}
            />

            {(error || token === "") && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-800 dark:text-red-300">
                {error ||
                  "Invalid reset link. Please use the link from your email."}
              </div>
            )}

            {resetPassword.isError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-800 dark:text-red-300">
                {getErrorMessage(resetPassword.error)}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={resetPassword.isPending || !token}
            >
              {resetPassword.isPending ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return <ResetPasswordContent />;
}
