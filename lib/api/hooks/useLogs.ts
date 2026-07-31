'use client';

import { useQuery } from '@tanstack/react-query';
import {
  logsApi,
  GetLogsParams,
  GetAttackOriginsParams,
  GetLogAnalyticsParams,
} from '../logs';

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

// Server-side aggregates used by Overview and Attack Trends. Components with
// the same host/range share this query instead of downloading raw log pages.
export function useLogAnalytics(params: GetLogAnalyticsParams) {
  return useQuery({
    queryKey: ['log-analytics', params.range, params.host ?? 'all'],
    queryFn: () => logsApi.getAnalytics(params),
    staleTime: 10 * 1000,
    refetchInterval: 30 * 1000,
    refetchIntervalInBackground: false,
  });
}

// Get attack origins
export function useAttackOrigins(params?: GetAttackOriginsParams) {
  return useQuery({
    queryKey: ['attack-origins', params],
    queryFn: () => logsApi.getAttackOrigins(params),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
    refetchIntervalInBackground: false,
  });
}

