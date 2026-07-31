"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import {
  authApi,
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AcceptInvitationRequest,
} from "../auth";
import toast from "react-hot-toast";

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || fallback;
  }
  return fallback;
}

// Login mutation
export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (data) => {
      // A shared browser may previously have held another tenant's protected
      // queries. Clear them before installing the new session.
      queryClient.clear();

      // Store auth data in localStorage
      const authData = {
        email: data.user.email,
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
        user: data.user,
      };
      localStorage.setItem("modsecurity_auth", JSON.stringify(authData));

      // Invalidate and refetch user data
      queryClient.setQueryData(["auth", "me"], data.user);

      toast.success("Login successful!");
      router.push("/dashboard");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Login failed. Please try again."));
    },
  });
}

// Logout mutation
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      localStorage.removeItem("modsecurity_auth");
      queryClient.clear();
      toast.success("Logged out successfully");
      router.push("/");
    },
    onError: () => {
      // Even if API call fails, clear local storage
      localStorage.removeItem("modsecurity_auth");
      queryClient.clear();
      router.push("/");
    },
  });
}

/** Session user is loaded via AuthProvider (`useQuery` key `["auth","me"]`). */

// Forgot password mutation
export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) => authApi.forgotPassword(data),
    onSuccess: (data) => {
      toast.success(data.message || "Password reset email sent!");
    },
    onError: (error: unknown) => {
      toast.error(
        getApiErrorMessage(
          error,
          "Failed to send reset email. Please try again."
        )
      );
    },
  });
}

// Reset password mutation
export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => authApi.resetPassword(data),
    onSuccess: (data) => {
      toast.success(data.message || "Password reset successfully!");
      router.push("/");
    },
    onError: (error: unknown) => {
      toast.error(
        getApiErrorMessage(
          error,
          "Failed to reset password. Please try again."
        )
      );
    },
  });
}

// Accept invitation mutation
export function useAcceptInvitation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: AcceptInvitationRequest) =>
      authApi.acceptInvitation(data),
    onSuccess: (data) => {
      toast.success(data.message || "Invitation accepted successfully!");

      if (data.session) {
        queryClient.clear();
        const authData = {
          email: data.user?.email,
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
          user: data.user,
        };
        localStorage.setItem("modsecurity_auth", JSON.stringify(authData));

        if (data.user) {
          queryClient.setQueryData(["auth", "me"], data.user);
        }
        router.push("/dashboard");
        return;
      }

      localStorage.removeItem("modsecurity_auth");
      queryClient.clear();
      window.location.assign("/");
    },
    onError: (error: unknown) => {
      toast.error(
        getApiErrorMessage(
          error,
          "Failed to accept invitation. Please try again."
        )
      );
    },
  });
}

export function useInvitationDetails(token: string) {
  return useQuery({
    queryKey: ["invitations", "validate", token],
    queryFn: () => authApi.validateInvitation(token),
    enabled: Boolean(token),
    retry: false,
    staleTime: 60 * 1000,
  });
}
