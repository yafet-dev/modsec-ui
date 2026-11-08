import apiClient from "./client";

export interface RetentionLimit {
  min: number;
  max: number;
  default: number;
  recommendedMax: number;
}

export interface DataRetentionSettings {
  logRetentionDays: number;
  rawRetentionDays: number;
}

export interface DataRetentionResponse {
  organizationId: string;
  settings: DataRetentionSettings;
  limits: { logs: RetentionLimit; raw: RetentionLimit };
  stats: {
    logCount: number;
    logsLast7Days: number;
    /** Average organized events per day, measured over the last 7 days. */
    dailyEvents: number;
    oldestLogAt: string | null;
    /** On-disk bytes per row including indexes. */
    avgLogRowBytes: number;
    avgRawRowBytes: number;
    /** False when the tables are too small to measure, so typical sizes are used. */
    rowSizeMeasured: boolean;
  };
  lastRun: { at: string; logsDeleted: number; rawDeleted: number } | null;
  schedule: { enabled: boolean; cron: string; timezone: "UTC" };
  canManage: boolean;
}

export interface UpdateDataRetentionRequest {
  logRetentionDays?: number;
  rawRetentionDays?: number;
  /** Required when raising log retention above the recommended maximum. */
  acknowledgeStorageWarning?: boolean;
}

export const dataRetentionApi = {
  get: async (organizationId: string): Promise<DataRetentionResponse> => {
    const response = await apiClient.get<DataRetentionResponse>(
      `/organizations/${organizationId}/data-retention`
    );
    return response.data;
  },

  update: async (
    organizationId: string,
    data: UpdateDataRetentionRequest
  ): Promise<{ settings: DataRetentionSettings }> => {
    const response = await apiClient.patch<{ settings: DataRetentionSettings }>(
      `/organizations/${organizationId}/data-retention`,
      data
    );
    return response.data;
  },
};
