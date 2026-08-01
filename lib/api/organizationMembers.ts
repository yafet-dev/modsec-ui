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

export interface ResendInvitationResponse {
  message: string;
}

export interface DeleteOrganizationMemberResponse {
  message: string;
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

  resendInvitation: async (
    memberId: string
  ): Promise<ResendInvitationResponse> => {
    const response = await apiClient.post<ResendInvitationResponse>(
      `/organization-members/${memberId}/resend-invitation`
    );
    return response.data;
  },

  toggleDisabled: async (userId: string): Promise<{ message: string; user: { id: string; email: string; fullName: string | null; disabled: boolean } }> => {
    const response = await apiClient.patch<{ message: string; user: { id: string; email: string; fullName: string | null; disabled: boolean } }>(
      `/organization-members/${userId}/toggle-disabled`
    );
    return response.data;
  },

  deleteMember: async (
    memberId: string
  ): Promise<DeleteOrganizationMemberResponse> => {
    const response = await apiClient.delete<DeleteOrganizationMemberResponse>(
      `/organization-members/${memberId}`
    );
    return response.data;
  },
};


