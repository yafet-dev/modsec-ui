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
  token: string;
  password: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface AcceptInvitationRequest {
  token: string;
  password?: string;
}

export interface AcceptInvitationResponse {
  message: string;
  requiresLogin: boolean;
  user?: {
    id: string;
    email: string;
    fullName: string | null;
    role: string | null;
  };
  session?: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
}

export interface InvitationDetails {
  email: string;
  organizationName: string;
  role: string;
  requiresPassword: boolean;
  expiresAt: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string | null;
  role: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
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

  refreshToken: async (
    data: RefreshTokenRequest
  ): Promise<RefreshTokenResponse> => {
    const response = await apiClient.post<RefreshTokenResponse>(
      "/auth/refresh",
      data
    );
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

  validateInvitation: async (token: string): Promise<InvitationDetails> => {
    const response = await apiClient.post<InvitationDetails>(
      "/invitations/validate",
      { token }
    );
    return response.data;
  },
};
