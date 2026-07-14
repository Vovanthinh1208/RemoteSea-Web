import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAlert,
  deleteAlert,
  listAlerts,
  setAlertActive,
} from "@/features/alerts/alerts.service";
import { useAuth } from "@/contexts/AuthContext";
import { alertKeys } from "@/core/query/query-keys";

export const ALERTS_KEY = alertKeys.all;

type SetAlertActivePayload = { id: string; isActive: boolean };

export const useAlerts = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: alertKeys.all,
    queryFn: ({ signal }) => listAlerts({ signal }),
    enabled: !!user,
  });
};

export const useCreateAlert = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alertKeys.all });
    },
  });
};

export const useSetAlertActive = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: SetAlertActivePayload) => setAlertActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alertKeys.all });
    },
  });
};

export const useDeleteAlert = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alertKeys.all });
    },
  });
};
