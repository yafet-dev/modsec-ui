import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { dataRetentionApi, UpdateDataRetentionRequest } from "../dataRetention";

export function useDataRetention(organizationId: string | null) {
  return useQuery({
    queryKey: ["dataRetention", organizationId],
    queryFn: () => dataRetentionApi.get(organizationId!),
    enabled: !!organizationId,
    staleTime: 60 * 1000,
  });
}

export function useUpdateDataRetention(organizationId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateDataRetentionRequest) =>
      dataRetentionApi.update(organizationId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dataRetention", organizationId] });
      toast.success("Data retention saved");
    },
    onError: (error: unknown) => {
      const message = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      toast.error(message || "Failed to save data retention settings");
    },
  });
}
