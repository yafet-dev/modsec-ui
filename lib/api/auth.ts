import apiClient from "./client";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    fullName: string | null;
    role: string | null;
  };
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  password: string;
  access_token: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface AcceptInvitationRequest {
  token: string;
  password: string;
}

export interface AcceptInvitationResponse {
  message: string;
  user: {
    id: string;
    email: string;
    fullName: string | null;
    role: string | null;
  };
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
}

export interface User {
  id: string;
  email: string;
  fullName: string | null;
  role: string | null;
  createdAt: string;
  updatedAt: string;
}

// Auth API functions
export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>("/auth/login", data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout");
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get<User>("/auth/me");
    return response.data;
  },

  forgotPassword: async (
    data: ForgotPasswordRequest
  ): Promise<ForgotPasswordResponse> => {
    const response = await apiClient.post<ForgotPasswordResponse>(
      "/auth/forgot-password",
      data
    );
    return response.data;
  },

  resetPassword: async (
    data: ResetPasswordRequest
  ): Promise<ResetPasswordResponse> => {
    const response = await apiClient.post<ResetPasswordResponse>(
      "/auth/reset-password",
      data
    );
    return response.data;
  },

  acceptInvitation: async (
    data: AcceptInvitationRequest
  ): Promise<AcceptInvitationResponse> => {
    const response = await apiClient.post<AcceptInvitationResponse>(
      "/invitations/accept",
      data
    );
    return response.data;
  },
};
