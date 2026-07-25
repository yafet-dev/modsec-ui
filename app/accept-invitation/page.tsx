"use client";

import { useState } from "react";
import { isAxiosError } from "axios";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  useAcceptInvitation,
  useInvitationDetails,
} from "@/lib/api/hooks/useAuth";
import { useEmailActionToken } from "@/lib/hooks/useEmailActionToken";

function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || fallback;
  }
  return fallback;
}

function AcceptInvitationContent() {
  const token = useEmailActionToken();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  const invitation = useInvitationDetails(token || "");
  const acceptInvitation = useAcceptInvitation();

  const validatePassword = (): boolean => {
    if (!invitation.data?.requiresPassword) {
      setPasswordErrors({});
      return true;
    }

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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!token) {
      setError("Invalid invitation link. Please use the link from your email.");
      return;
    }

    if (!invitation.data || !validatePassword()) return;

    acceptInvitation.mutate({
      token,
      ...(invitation.data.requiresPassword ? { password } : {}),
    });
  };

  const validationError =
    token === ""
      ? "Invalid invitation link. Token is missing. Please use the link from your email."
      : invitation.isError
    ? getErrorMessage(
        invitation.error,
        "This invitation is invalid or has expired. Please ask an administrator for a new invitation."
      )
    : "";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-semibold mb-2 text-gray-900 dark:text-white">
            Accept Invitation
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {invitation.data?.requiresPassword
              ? "Create a password to complete your account setup"
              : "Review and accept your team invitation"}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          {token === null || (invitation.isLoading && token) ? (
            <div className="py-8 text-center" role="status">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Checking your invitation...
              </p>
            </div>
          ) : error || validationError ? (
            <div className="space-y-5">
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-800 dark:text-red-300">
                {error || validationError}
              </div>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => (window.location.href = "/")}
              >
                Back to Login
              </Button>
            </div>
          ) : invitation.data ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <dl className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm dark:border-gray-700 dark:bg-gray-900/50">
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500 dark:text-gray-400">Email</dt>
                  <dd className="text-right font-medium text-gray-900 dark:text-white break-all">
                    {invitation.data.email}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500 dark:text-gray-400">
                    Organization
                  </dt>
                  <dd className="text-right font-medium text-gray-900 dark:text-white">
                    {invitation.data.organizationName}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500 dark:text-gray-400">Role</dt>
                  <dd className="text-right font-medium capitalize text-gray-900 dark:text-white">
                    {invitation.data.role}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500 dark:text-gray-400">Expires</dt>
                  <dd className="text-right font-medium text-gray-900 dark:text-white">
                    {new Date(invitation.data.expiresAt).toLocaleString()}
                  </dd>
                </div>
              </dl>

              {invitation.data.requiresPassword && (
                <>
                  <Input
                    type="password"
                    label="Password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setPasswordErrors((current) => ({
                        ...current,
                        password: undefined,
                      }));
                    }}
                    required
                    error={passwordErrors.password}
                  />

                  <Input
                    type="password"
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);
                      setPasswordErrors((current) => ({
                        ...current,
                        confirmPassword: undefined,
                      }));
                    }}
                    required
                    error={passwordErrors.confirmPassword}
                  />
                </>
              )}

              {acceptInvitation.isError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-800 dark:text-red-300">
                  {getErrorMessage(
                    acceptInvitation.error,
                    "Failed to accept invitation"
                  )}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={acceptInvitation.isPending}
              >
                {acceptInvitation.isPending
                  ? "Accepting..."
                  : invitation.data.requiresPassword
                    ? "Accept Invitation & Set Password"
                    : "Accept Invitation"}
              </Button>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return <AcceptInvitationContent />;
}
