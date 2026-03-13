import apiClient from './client';

export interface IPBan {
  id: string;
  organizationId: string;
  ip: string;
  domains: string[];
  country: string | null;
  countryName: string | null;
  reason: string | null;
  bannedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIPBanRequest {
  ip: string;
  domains: string[]; // Array of domains or ["*"] for all domains
  reason?: string;
  // Country is auto-detected by backend from IP
}

// IP Ban API functions
export const ipBanApi = {
  getAll: async (organizationId: string): Promise<IPBan[]> => {
    const response = await apiClient.get<IPBan[]>(`/organizations/${organizationId}/ip-bans`);
    return response.data;
  },

  create: async (organizationId: string, data: CreateIPBanRequest): Promise<IPBan> => {
    const response = await apiClient.post<IPBan>(`/organizations/${organizationId}/ip-bans`, data);
    return response.data;
  },

  delete: async (organizationId: string, ipBanId: string): Promise<void> => {
    await apiClient.delete(`/organizations/${organizationId}/ip-bans/${ipBanId}`);
  },
};
