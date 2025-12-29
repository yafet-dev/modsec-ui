import apiClient from "./client";

export interface UserMembership {
  id: string;
  organizationId: string;
  role: string;
  status: string;
  organization: {
    id: string;
    name: string;
    domains: string[];
  };
}

export interface User {
  id: string;
  email: string;
  fullName: string | null;
  disabled: boolean;
  lastLogin: string | null;
  role: string | null;
  memberships: UserMembership[];
}

// User API functions
export const userApi = {
  getAll: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>("/users");
    return response.data;
  },
};

