"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  domainWafApi,
  DomainWAFStatus,
  ToggleWAFRequest,
  BulkUpdateWAFRequest,
} from "../domainWaf";
import toast from "react-hot-toast";

/**
 * Hook to fetch WAF status for an organization
 */
export function useDomainWafStatus(organizationId: string | null) {
  return useQuery({
    queryKey: ["domainWaf", organizationId],
    queryFn: () => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return domainWafApi.getStatus(organizationId);
    },
    enabled: !!organizationId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to toggle WAF status for a single domain
 */
export function useToggleDomainWaf() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      domain,
      enabled,
    }: {
      organizationId: string;
      domain: string;
      enabled: boolean;
    }) => domainWafApi.toggleDomain(organizationId, domain, enabled),
    onSuccess: (data, variables) => {
      // Invalidate and refetch WAF status
      queryClient.invalidateQueries({
        queryKey: ["domainWaf", variables.organizationId],
      });
      
      // Show success message
      toast.success(data.message || "WAF status updated successfully");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        "Failed to update WAF status. Please try again.";
      toast.error(message);
    },
  });
}

/**
 * Hook to bulk update WAF status for multiple domains
 */
export function useBulkUpdateDomainWaf() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      domains,
    }: {
      organizationId: string;
      domains: DomainWAFStatus[];
    }) => domainWafApi.bulkUpdate(organizationId, domains),
    onSuccess: (data, variables) => {
      // Invalidate and refetch WAF status
      queryClient.invalidateQueries({
        queryKey: ["domainWaf", variables.organizationId],
      });
      
      toast.success("WAF statuses updated successfully");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        "Failed to update WAF statuses. Please try again.";
      toast.error(message);
    },
  });
}

