'use client';

import { useQuery } from '@tanstack/react-query';
import { logsApi, GetLogsParams, GetAttackOriginsParams } from '../logs';

// Get logs with filters
export function useLogs(params?: GetLogsParams) {
  return useQuery({
    queryKey: ['logs', params],
    queryFn: () => logsApi.getAll(params),
    staleTime: 10 * 1000, // 10 seconds - logs update frequently
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
}

// Get log by ID
export function useLog(id: string | null) {
  return useQuery({
    queryKey: ['logs', id],
    queryFn: () => logsApi.getById(id!),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

// Get the hosts that actually appear in the caller's logs
export function useLogHosts(organizationId?: string) {
  return useQuery({
    queryKey: ['log-hosts', organizationId],
    queryFn: () => logsApi.getHosts(organizationId),
    // Hosts change far less often than individual log lines.
    staleTime: 5 * 60 * 1000,
  });
}

// Get attack origins
export function useAttackOrigins(params?: GetAttackOriginsParams) {
  return useQuery({
    queryKey: ['attack-origins', params],
    queryFn: () => logsApi.getAttackOrigins(params),
    staleTime: 10 * 1000, // 10 seconds - match logs refresh rate
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time updates
  });
}

