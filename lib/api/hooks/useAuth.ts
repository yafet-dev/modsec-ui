"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  authApi,
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AcceptInvitationRequest,
} from "../auth";
import toast from "react-hot-toast";

// Login mutation
export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (data) => {
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
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Login failed. Please try again.";
      toast.error(message);
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

// Get current user
export function useGetMe() {
  const authData =
    typeof window !== "undefined"
      ? localStorage.getItem("modsecurity_auth")
      : null;
  const isAuthenticated = !!authData;

  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authApi.getMe(),
    enabled: isAuthenticated,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Forgot password mutation
export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) => authApi.forgotPassword(data),
    onSuccess: (data) => {
      toast.success(data.message || "Password reset email sent!");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        "Failed to send reset email. Please try again.";
      toast.error(message);
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
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        "Failed to reset password. Please try again.";
      toast.error(message);
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

      toast.success(data.message || "Invitation accepted successfully!");
      router.push("/dashboard");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        "Failed to accept invitation. Please try again.";
      toast.error(message);
    },
  });
}
