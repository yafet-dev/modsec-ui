import apiClient from "./client";

export interface NotificationSettings {
  id: string;
  organizationId: string;
  notificationType: "email" | "telegram";
  emailList: string[];
  telegramChatId: string | null;
  telegramUserId: string | null;
  telegramEnabled: boolean;
  telegramConnectedAt: string | null;
  domainFilter: "all" | "specific";
  selectedDomains: string[];
  severityFilter: "all" | "critical" | "high" | "low";
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// Telegram-specific types
export interface TelegramStartLinkResponse {
  connectCode: string;
  deepLink: string | null;
  botUsername: string | null;
  expiresAt: string;
  instructions: string;
}

export interface TelegramStatusResponse {
  connected: boolean;
  telegramChatId: string | null;
  connectedAt: string | null;
}

export interface OrganizationNotificationSettings {
  organizationId: string;
  settings: NotificationSettings[];
}

export interface SaveNotificationSettingsRequest {
  notificationType: "email" | "telegram";
  emailList?: string[];
  telegramChatId?: string;
  domainFilter: "all" | "specific";
  selectedDomains?: string[];
  severityFilter: "all" | "critical" | "high" | "low";
  enabled?: boolean;
}

export interface UpdateNotificationSettingsRequest {
  notificationType?: "email" | "telegram";
  emailList?: string[];
  telegramChatId?: string;
  domainFilter?: "all" | "specific";
  selectedDomains?: string[];
  severityFilter?: "all" | "critical" | "high" | "low";
  enabled?: boolean;
}

// Notification Settings API functions
export const notificationSettingsApi = {
  /**
   * Get all notification settings for an organization
   */
  getAll: async (organizationId: string): Promise<OrganizationNotificationSettings> => {
    const response = await apiClient.get<OrganizationNotificationSettings>(
      `/organizations/${organizationId}/notification-settings`
    );
    return response.data;
  },

  /**
   * Create notification settings
   */
  create: async (
    organizationId: string,
    data: SaveNotificationSettingsRequest
  ): Promise<NotificationSettings> => {
    const response = await apiClient.post<NotificationSettings>(
      `/organizations/${organizationId}/notification-settings`,
      data
    );
    return response.data;
  },

  /**
   * Update notification settings
   */
  update: async (
    organizationId: string,
    settingsId: string,
    data: UpdateNotificationSettingsRequest
  ): Promise<NotificationSettings> => {
    const response = await apiClient.put<NotificationSettings>(
      `/organizations/${organizationId}/notification-settings/${settingsId}`,
      data
    );
    return response.data;
  },

  /**
   * Delete notification settings
   */
  delete: async (organizationId: string, settingsId: string): Promise<void> => {
    await apiClient.delete(
      `/organizations/${organizationId}/notification-settings/${settingsId}`
    );
  },

  /**
   * Send sample notification
   */
  sendSample: async (
    organizationId: string,
    data: {
      notificationType: "email" | "telegram";
      emailList?: string[];
    }
  ): Promise<{ message: string; sentTo: string[] }> => {
    const response = await apiClient.post<{ message: string; sentTo: string[] }>(
      `/organizations/${organizationId}/notification-settings/send-sample`,
      data
    );
    return response.data;
  },
};

// Telegram API functions
export const telegramApi = {
  /**
   * Generate a connect code / deep-link for Telegram
   */
  startLink: async (
    organizationId: string
  ): Promise<TelegramStartLinkResponse> => {
    const response = await apiClient.post<TelegramStartLinkResponse>(
      "/telegram/start-link",
      { organizationId }
    );
    return response.data;
  },

  /**
   * Get Telegram connection status for an organization
   */
  getStatus: async (
    organizationId: string
  ): Promise<TelegramStatusResponse> => {
    const response = await apiClient.get<TelegramStatusResponse>(
      `/telegram/status?organizationId=${organizationId}`
    );
    return response.data;
  },

  /**
   * Disconnect Telegram from an organization
   */
  disconnect: async (organizationId: string): Promise<{ ok: boolean; message: string }> => {
    const response = await apiClient.post<{ ok: boolean; message: string }>(
      "/telegram/disconnect",
      { organizationId }
    );
    return response.data;
  },

  /**
   * Send a test Telegram message
   */
  sendTest: async (
    organizationId?: string
  ): Promise<{ ok: boolean; error?: string }> => {
    const response = await apiClient.post<{ ok: boolean; error?: string }>(
      "/telegram/test",
      organizationId ? { organizationId } : {}
    );
    return response.data;
  },
};
