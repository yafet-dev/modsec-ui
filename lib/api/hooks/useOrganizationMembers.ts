"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  organizationMembersApi,
  type InviteUserRequest,
  type MyOrganizationMembersResponse,
} from "../organizationMembers";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || fallback;
  }
  return fallback;
}

// Get my organization members
export function useMyOrganizationMembers() {
  return useQuery({
    queryKey: ["organization-members", "my-organization"],
    queryFn: () => organizationMembersApi.getMyOrganization(),
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Invite user to organization
export function useInviteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InviteUserRequest) => organizationMembersApi.invite(data),
    onSuccess: (data) => {
      // Invalidate and refetch organization members
      queryClient.invalidateQueries({ queryKey: ["organization-members"] });
      toast.success(data.message);
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to invite user"));
    },
  });
}

// Resend an invitation to a pending organization member
export function useResendInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) =>
      organizationMembersApi.resendInvitation(memberId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["organization-members"] });
      toast.success(data.message);
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to resend invitation"));
    },
  });
}

// Toggle user disabled status
export function useToggleUserDisabled() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => organizationMembersApi.toggleDisabled(userId),
    onSuccess: (data) => {
      // Invalidate and refetch organization members
      queryClient.invalidateQueries({ queryKey: ["organization-members"] });
      toast.success(data.message);
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to update user status"));
    },
  });
}

// Delete a member from the current admin's organization
export function useDeleteOrganizationMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) =>
      organizationMembersApi.deleteMember(memberId),
    onSuccess: (data, memberId) => {
      queryClient.setQueryData<MyOrganizationMembersResponse>(
        ["organization-members", "my-organization"],
        (current) =>
          current
            ? {
                ...current,
                members: current.members.filter(
                  (member) => member.id !== memberId
                ),
              }
            : current
      );
      queryClient.invalidateQueries({ queryKey: ["organization-members"] });
      toast.success(data.message);
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to delete user"));
    },
  });
}


