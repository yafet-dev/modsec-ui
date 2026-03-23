'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  organizationApi,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  SummaryReportSettingsRequest,
} from '../organization';
import toast from 'react-hot-toast';

// Get all organizations
export function useOrganizations() {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: () => organizationApi.getAll(),
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Get my organizations
export function useMyOrganizations() {
  return useQuery({
    queryKey: ['organizations', 'my'],
    queryFn: () => organizationApi.getMy(),
    staleTime: 30 * 1000,
  });
}

// Get organization by ID
export function useOrganization(id: string | null) {
  return useQuery({
    queryKey: ['organizations', id],
    queryFn: () => organizationApi.getById(id!),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

// Create organization mutation
export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrganizationRequest) => organizationApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Organization created successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create organization. Please try again.';
      toast.error(message);
    },
  });
}

// Update organization mutation
export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrganizationRequest }) =>
      organizationApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['organizations', variables.id] });
      toast.success('Organization updated successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update organization. Please try again.';
      toast.error(message);
    },
  });
}

// One-time 7-day summary email (org admin only)
export function useSendSummaryReportNow() {
  return useMutation({
    mutationFn: ({
      organizationId,
      emails,
    }: {
      organizationId: string;
      emails: string[];
    }) => organizationApi.sendSummaryReportNow(organizationId, { emails }),
    onSuccess: (data) => {
      toast.success(
        `Sent ${data.sent} report email${data.sent === 1 ? "" : "s"} (last 7 days)`
      );
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Could not send the report. Check SMTP and try again.";
      toast.error(message);
    },
  });
}

// Summary report settings (org admin only)
export function useUpdateSummaryReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      data,
    }: {
      organizationId: string;
      data: SummaryReportSettingsRequest;
    }) => organizationApi.updateSummaryReport(organizationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations', 'my'] });
      toast.success('Summary report settings saved');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Failed to save summary report settings.';
      toast.error(message);
    },
  });
}

// Delete organization mutation
export function useDeleteOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => organizationApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Organization deleted successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete organization. Please try again.';
      toast.error(message);
    },
  });
}

