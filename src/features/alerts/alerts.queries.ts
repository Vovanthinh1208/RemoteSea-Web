import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAlert,
  deleteAlert,
  listAlerts,
  setAlertActive,
} from "@/features/alerts/alerts.service";
import { useAuth } from "@/contexts/AuthContext";
import { alertKeys } from "@/core/query/query-keys";
import type { JobAlert } from "@/types/alert";

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
    // Optimistic — flip the Active/Paused pill immediately rather than waiting a
    // full round-trip for the invalidated list to refetch (the toggle looked
    // unresponsive otherwise). Mirrors the saved-jobs toggle pattern; rollback
    // on error, then confirm via the settle invalidation.
    onMutate: async ({ id, isActive }) => {
      await queryClient.cancelQueries({ queryKey: alertKeys.all });
      const previous = queryClient.getQueryData<JobAlert[]>(alertKeys.all);
      queryClient.setQueryData<JobAlert[]>(alertKeys.all, (old) =>
        old?.map((alert) => (alert.id === id ? { ...alert, isActive } : alert))
      );
      return { previous };
    },
    onError: (_err, _payload, context) => {
      if (context?.previous) queryClient.setQueryData(alertKeys.all, context.previous);
    },
    onSettled: () => {
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
