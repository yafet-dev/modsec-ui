import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  notificationSettingsApi,
  telegramApi,
  NotificationSettings,
  SaveNotificationSettingsRequest,
  UpdateNotificationSettingsRequest,
} from "../notificationSettings";
import toast from "react-hot-toast";

/**
 * Hook to fetch all notification settings for an organization
 */
export function useNotificationSettings(organizationId: string | undefined) {
  return useQuery({
    queryKey: ["notificationSettings", organizationId],
    queryFn: () => notificationSettingsApi.getAll(organizationId!),
    enabled: !!organizationId,
  });
}

/**
 * Hook to create notification settings
 */
export function useCreateNotificationSettings(organizationId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SaveNotificationSettingsRequest) =>
      notificationSettingsApi.create(organizationId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificationSettings", organizationId] });
      toast.success("Notification settings saved successfully");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to save notification settings";
      toast.error(message);
    },
  });
}

/**
 * Hook to update notification settings
 */
export function useUpdateNotificationSettings(organizationId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      settingsId,
      data,
    }: {
      settingsId: string;
      data: UpdateNotificationSettingsRequest;
    }) => notificationSettingsApi.update(organizationId!, settingsId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificationSettings", organizationId] });
      toast.success("Notification settings updated successfully");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to update notification settings";
      toast.error(message);
    },
  });
}

/**
 * Hook to delete notification settings
 */
export function useDeleteNotificationSettings(organizationId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settingsId: string) =>
      notificationSettingsApi.delete(organizationId!, settingsId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificationSettings", organizationId] });
      toast.success("Notification settings deleted successfully");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to delete notification settings";
      toast.error(message);
    },
  });
}

/**
 * Hook to send sample notification
 */
export function useSendSampleNotification(organizationId: string | undefined) {
  return useMutation({
    mutationFn: (data: { notificationType: "email" | "telegram"; emailList?: string[] }) =>
      notificationSettingsApi.sendSample(organizationId!, data),
    onSuccess: (data) => {
      toast.success(`Sample notification sent to ${data.sentTo.length} recipient(s)`);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to send sample notification";
      toast.error(message);
    },
  });
}

// ---------------------------------------------------------------------------
// Telegram hooks
// ---------------------------------------------------------------------------

/**
 * Hook to get Telegram connection status
 */
export function useTelegramStatus(organizationId: string | undefined) {
  return useQuery({
    queryKey: ["telegramStatus", organizationId],
    queryFn: () => telegramApi.getStatus(organizationId!),
    enabled: !!organizationId,
    refetchInterval: (query) => {
      // Poll every 3s while we have an active link request (waiting for user to connect)
      return query.state.data?.connected ? false : 3000;
    },
  });
}

/**
 * Hook to generate a Telegram connect deep-link
 */
export function useTelegramStartLink(organizationId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => telegramApi.startLink(organizationId!),
    onSuccess: () => {
      // Start polling status
      queryClient.invalidateQueries({
        queryKey: ["telegramStatus", organizationId],
      });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to generate Telegram link";
      toast.error(message);
    },
  });
}

/**
 * Hook to disconnect Telegram
 */
export function useTelegramDisconnect(organizationId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => telegramApi.disconnect(organizationId!),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["telegramStatus", organizationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["notificationSettings", organizationId],
      });
      toast.success("Telegram disconnected");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to disconnect Telegram";
      toast.error(message);
    },
  });
}

/**
 * Hook to send a Telegram test message
 */
export function useTelegramTest(organizationId: string | undefined) {
  return useMutation({
    mutationFn: () => telegramApi.sendTest(organizationId),
    onSuccess: () => {
      toast.success("Test message sent to Telegram ✅");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.error || "Failed to send test message";
      toast.error(message);
    },
  });
}