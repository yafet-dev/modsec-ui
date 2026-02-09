"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ipBanApi, IPBan, CreateIPBanRequest } from "../ipBan";
import toast from "react-hot-toast";

export function useIPBans(organizationId: string | null) {
  return useQuery({
    queryKey: ["ip-bans", organizationId],
    queryFn: () => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return ipBanApi.getAll(organizationId);
    },
    enabled: !!organizationId,
  });
}

export function useCreateIPBan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      data,
    }: {
      organizationId: string;
      data: CreateIPBanRequest;
    }) => ipBanApi.create(organizationId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["ip-bans", variables.organizationId] });
      toast.success("IP banned successfully");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to ban IP. Please try again.";
      toast.error(message);
    },
  });
}

export function useDeleteIPBan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      ipBanId,
    }: {
      organizationId: string;
      ipBanId: string;
    }) => ipBanApi.delete(organizationId, ipBanId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["ip-bans", variables.organizationId] });
      toast.success("IP unbanned successfully");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to unban IP. Please try again.";
      toast.error(message);
    },
  });
}
