"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAcceptInvitation } from "@/lib/api/hooks/useAuth";

export default function AcceptInvitationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState<string>("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  const acceptInvitation = useAcceptInvitation();

  useEffect(() => {
    // Extract token from URL hash (Supabase redirects with hash)
    // Format: #access_token=xxx&type=invite&...
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");
      const type = params.get("type");

      if (type === "invite" && accessToken) {
        setToken(accessToken);
        return;
      }
    }

    // Fallback: check query params
    const urlToken = searchParams.get("token");
    if (urlToken) {
      setToken(urlToken);
    } else {
      setError(
        "Invalid invitation link. Token is missing. Please use the link from your email."
      );
    }
  }, [searchParams]);

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
      setError("Invalid invitation link. Please use the link from your email.");
      return;
    }

    acceptInvitation.mutate({ token, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-semibold mb-2 text-gray-900 dark:text-white">
            Accept Invitation
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Set your password to complete your account setup
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="password"
              label="Password"
              placeholder="Enter your password"
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
              label="Confirm Password"
              placeholder="Confirm your password"
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

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-800 dark:text-red-300">
                {error}
              </div>
            )}

            {acceptInvitation.isError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-800 dark:text-red-300">
                {acceptInvitation.error?.response?.data?.message ||
                  "Failed to accept invitation"}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={acceptInvitation.isPending || !token}
            >
              {acceptInvitation.isPending
                ? "Accepting..."
                : "Accept Invitation & Set Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
