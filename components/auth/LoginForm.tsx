"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLogin, useForgotPassword } from "@/lib/api/hooks/useAuth";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");

  const loginMutation = useLogin();
  const forgotPasswordMutation = useForgotPassword();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    loginMutation.mutate(
      { email, password },
      {
        onError: (error: any) => {
          setError(
            error.response?.data?.message || "Invalid email or password"
          );
        },
      }
    );
  };

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();

    if (!forgotPasswordEmail) {
      return;
    }

    forgotPasswordMutation.mutate(
      { email: forgotPasswordEmail },
      {
        onSuccess: () => {
          setTimeout(() => {
            setShowForgotPassword(false);
            setForgotPasswordEmail("");
          }, 3000);
        },
      }
    );
  };

  if (showForgotPassword) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-semibold mb-2 text-gray-900 dark:text-white">
            Reset Password
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Enter your email to receive a password reset link
          </p>
        </div>

        <form onSubmit={handleForgotPassword} className="space-y-6">
          <Input
            type="email"
            label="Email"
            placeholder="your.email@example.com"
            value={forgotPasswordEmail}
            onChange={(e) => setForgotPasswordEmail(e.target.value)}
            required
            error={
              forgotPasswordMutation.isError
                ? "Failed to send reset email"
                : undefined
            }
          />

          {forgotPasswordMutation.isSuccess && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-800 dark:text-green-300">
              {forgotPasswordMutation.data?.message ||
                "Password reset email sent! Please check your email."}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={forgotPasswordMutation.isPending}
          >
            {forgotPasswordMutation.isPending
              ? "Sending..."
              : "Send Reset Link"}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => {
              setShowForgotPassword(false);
              setForgotPasswordEmail("");
              forgotPasswordMutation.reset();
            }}
          >
            Back to Login
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <img src="/Logo-blue.png" alt="Zergaw WAF" className="h-12 w-auto" />
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Sign in to access your dashboard
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          type="email"
          label="Email"
          placeholder="your.email@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          required
          error={
            error ||
            (loginMutation.isError ? "Invalid email or password" : undefined)
          }
        />

        <div>
          <Input
            type="password"
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Forgot password?
          </button>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </div>
  );
}
