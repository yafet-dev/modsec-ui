import apiClient from "./client";

export interface OrganizationMember {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  status: "pending" | "verified";
  user: {
    id: string;
    email: string;
    fullName: string | null;
    disabled: boolean;
    lastLogin: string | null;
  };
}

export interface MyOrganizationMembersResponse {
  organization: {
    id: string;
    name: string;
  };
  members: OrganizationMember[];
}

export interface InviteUserRequest {
  email: string;
  role: "admin" | "viewer";
}

export interface InviteUserResponse {
  message: string;
  member: OrganizationMember;
}

// Organization Members API functions
export const organizationMembersApi = {
  getMyOrganization: async (): Promise<MyOrganizationMembersResponse> => {
    const response = await apiClient.get<MyOrganizationMembersResponse>(
      "/organization-members/my-organization"
    );
    return response.data;
  },

  invite: async (data: InviteUserRequest): Promise<InviteUserResponse> => {
    const response = await apiClient.post<InviteUserResponse>(
      "/organization-members/invite",
      data
    );
    return response.data;
  },

  toggleDisabled: async (userId: string): Promise<{ message: string; user: { id: string; email: string; fullName: string | null; disabled: boolean } }> => {
    const response = await apiClient.patch<{ message: string; user: { id: string; email: string; fullName: string | null; disabled: boolean } }>(
      `/organization-members/${userId}/toggle-disabled`
    );
    return response.data;
  },
};


