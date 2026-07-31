import apiClient from './client';
import { LogEntry } from '@/data/logs';

export interface LogsResponse {
  logs: LogEntry[];
  total: number;
  page: number;
  limit: number;
}

export interface GetLogsParams {
  page?: number;
  limit?: number;
  organizationId?: string;
  host?: string;
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  action?: 'blocked' | 'warning';
  search?: string;
}

export interface AttackOrigin {
  ip: string;
  country: string;
  countryCode?: string;
  lat: number;
  lng: number;
  count: number;
  ipCount?: number;
  severity: 'high' | 'medium' | 'low';
}

export interface AttackOriginsResponse {
  origins: AttackOrigin[];
  windowDays: number;
}

export interface GetAttackOriginsParams {
  host?: string;
  limit?: number;
}

export type LogAnalyticsRange = '24h' | '7d' | '30d' | '3m';

export interface GetLogAnalyticsParams {
  range: LogAnalyticsRange;
  host?: string;
}

export interface LogAnalyticsResponse {
  range: LogAnalyticsRange;
  start: string;
  end: string;
  summary: {
    totalRequests: number;
    blockedAttacks: number;
    threatLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  };
  series: Array<{
    timestamp: string;
    attacks: number;
    blocked: number;
    allowed: number;
  }>;
}

export interface LogHost {
  host: string;
  count: number;
}

export interface LogHostsResponse {
  hosts: LogHost[];
}

// Logs API functions
export const logsApi = {
  getAll: async (params?: GetLogsParams): Promise<LogsResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.organizationId) queryParams.append('organizationId', params.organizationId);
    if (params?.host) queryParams.append('host', params.host);
    if (params?.severity) queryParams.append('severity', params.severity);
    if (params?.action) queryParams.append('action', params.action);
    if (params?.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const url = `/logs${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<LogsResponse>(url);
    return response.data;
  },

  getById: async (id: string): Promise<LogEntry> => {
    const response = await apiClient.get<LogEntry>(`/logs/${id}`);
    return response.data;
  },

  /**
   * Hosts that actually appear in the caller's logs, most frequent first.
   *
   * The organization's registered domains are apex names (gnzabe.com) while
   * traffic arrives on subdomains (apiprod.gnzabe.com), so a selector built
   * only from registered domains cannot target the host you want.
   */
  getHosts: async (organizationId?: string): Promise<LogHostsResponse> => {
    const queryParams = new URLSearchParams();
    if (organizationId) queryParams.append('organizationId', organizationId);

    const queryString = queryParams.toString();
    const response = await apiClient.get<LogHostsResponse>(
      `/logs/hosts${queryString ? `?${queryString}` : ''}`
    );
    return response.data;
  },

  getAnalytics: async (
    params: GetLogAnalyticsParams
  ): Promise<LogAnalyticsResponse> => {
    const queryParams = new URLSearchParams({ range: params.range });
    if (params.host) queryParams.append('host', params.host);

    const response = await apiClient.get<LogAnalyticsResponse>(
      `/logs/analytics?${queryParams.toString()}`
    );
    return response.data;
  },

  getAttackOrigins: async (params?: GetAttackOriginsParams): Promise<AttackOriginsResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.host) queryParams.append('host', params.host);
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const url = `/logs/attack-origins${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<AttackOriginsResponse>(url);
    return response.data;
  },
};

