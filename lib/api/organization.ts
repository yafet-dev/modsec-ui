import apiClient from './client';

export interface Organization {
  id: string;
  name: string;
  domains: string[];
  ownerEmail: string | null;
  status: 'active' | 'pending' | 'suspended' | 'disabled';
  createdAt: string;
  updatedAt: string;
  members?: OrganizationMember[];
}

export interface OrganizationMember {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  status: 'pending' | 'verified';
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    fullName: string | null;
  };
}

export interface CreateOrganizationRequest {
  name: string;
  domains: string[];
  adminEmail: string;
}

export interface UpdateOrganizationRequest {
  name?: string;
  domains?: string[];
  status?: 'active' | 'pending' | 'suspended' | 'disabled';
}

// Organization API functions
export const organizationApi = {
  getAll: async (): Promise<Organization[]> => {
    const response = await apiClient.get<Organization[]>('/organizations');
    return response.data;
  },

  getMy: async (): Promise<Organization[]> => {
    const response = await apiClient.get<Organization[]>('/organizations/my');
    return response.data;
  },

  getById: async (id: string): Promise<Organization> => {
    const response = await apiClient.get<Organization>(`/organizations/${id}`);
    return response.data;
  },

  create: async (data: CreateOrganizationRequest): Promise<Organization> => {
    const response = await apiClient.post<Organization>('/organizations', data);
    return response.data;
  },

  update: async (id: string, data: UpdateOrganizationRequest): Promise<Organization> => {
    const response = await apiClient.put<Organization>(`/organizations/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/organizations/${id}`);
  },
};

