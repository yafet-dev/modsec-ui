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
  lat: number;
  lng: number;
  count: number;
  severity: 'high' | 'medium' | 'low';
}

export interface AttackOriginsResponse {
  origins: AttackOrigin[];
}

export interface GetAttackOriginsParams {
  host?: string;
  limit?: number;
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

  getAttackOrigins: async (params?: GetAttackOriginsParams): Promise<AttackOriginsResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.host) queryParams.append('host', params.host);
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const url = `/logs/attack-origins${queryString ? `?${queryString}` : ''}`;
    
    console.log('[Attack Origins API] Fetching from:', url);
    const response = await apiClient.get<AttackOriginsResponse>(url);
    console.log('[Attack Origins API] Response:', response.data);
    console.log('[Attack Origins API] Origins count:', response.data?.origins?.length || 0);
    console.log('[Attack Origins API] Origins data:', JSON.stringify(response.data?.origins || [], null, 2));
    return response.data;
  },
};

