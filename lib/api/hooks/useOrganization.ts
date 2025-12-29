'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { organizationApi, CreateOrganizationRequest, UpdateOrganizationRequest } from '../organization';
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

