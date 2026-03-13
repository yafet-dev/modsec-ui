"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  geoAccessApi,
  GeoAccessControl,
  SaveGeoAccessRequest,
} from "../geoAccess";
import toast from "react-hot-toast";

/**
 * Hook to fetch geo access settings for an organization
 */
export function useGeoAccess(organizationId: string | null) {
  return useQuery({
    queryKey: ["geoAccess", organizationId],
    queryFn: () => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return geoAccessApi.getAll(organizationId);
    },
    enabled: !!organizationId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch geo access settings for a specific domain
 */
export function useGeoAccessByDomain(
  organizationId: string | null,
  domain: string | null
) {
  return useQuery({
    queryKey: ["geoAccess", organizationId, domain],
    queryFn: () => {
      if (!organizationId || !domain) {
        throw new Error("Organization ID and domain are required");
      }
      return geoAccessApi.getByDomain(organizationId, domain);
    },
    enabled: !!organizationId && !!domain,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to save geo access settings
 */
export function useSaveGeoAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      data,
    }: {
      organizationId: string;
      data: SaveGeoAccessRequest;
    }) => geoAccessApi.save(organizationId, data),
    onSuccess: (data, variables) => {
      // Invalidate and refetch geo access settings
      queryClient.invalidateQueries({
        queryKey: ["geoAccess", variables.organizationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["geoAccess", variables.organizationId, variables.data.domain],
      });

      toast.success("Geo access settings saved successfully");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to save geo access settings. Please try again.";
      toast.error(message);
    },
  });
}

/**
 * Hook to delete geo access settings
 */
export function useDeleteGeoAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      domain,
    }: {
      organizationId: string;
      domain: string;
    }) => geoAccessApi.delete(organizationId, domain),
    onSuccess: (data, variables) => {
      // Invalidate and refetch geo access settings
      queryClient.invalidateQueries({
        queryKey: ["geoAccess", variables.organizationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["geoAccess", variables.organizationId, variables.domain],
      });

      toast.success("Geo access settings deleted successfully");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to delete geo access settings. Please try again.";
      toast.error(message);
    },
  });
}
