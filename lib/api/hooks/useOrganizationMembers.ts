"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { organizationMembersApi, type InviteUserRequest } from "../organizationMembers";
import toast from "react-hot-toast";

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
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to invite user";
      toast.error(message);
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
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to update user status";
      toast.error(message);
    },
  });
}


