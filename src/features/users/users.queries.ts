import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  changeMyPassword,
  deleteMyAccount,
  disconnectMyConnection,
  exportMyData,
  getMyAccount,
  getMyNotificationPreferences,
  getMyPauseState,
  listMyConnections,
  listMySessions,
  pauseMyAccount,
  reactivateMyAccount,
  revokeMyOtherSessions,
  revokeMySession,
  updateMyAccount,
  updateMyName,
  updateMyNotificationPreferences,
} from "@/features/users/users.service";
import { useAuth } from "@/contexts/AuthContext";
import { usersKeys } from "@/core/query/query-keys";

export const useUpdateMyName = () => {
  const { patchUser } = useAuth();
  return useMutation({
    mutationFn: updateMyName,
    onSuccess: (result) => {
      patchUser({ name: result.name });
    },
  });
};

export const useChangeMyPassword = () =>
  useMutation({ mutationFn: changeMyPassword });

export const useDeleteMyAccount = () => {
  const { logout } = useAuth();
  return useMutation({
    mutationFn: deleteMyAccount,
    onSuccess: () => {
      logout();
    },
  });
};

export const useMyAccount = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: usersKeys.account(),
    queryFn: getMyAccount,
    enabled: !!user,
  });
};

export const useUpdateMyAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMyAccount,
    onSuccess: (result) => {
      queryClient.setQueryData(usersKeys.account(), result);
    },
  });
};

export const useMyNotificationPreferences = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: usersKeys.notificationPreferences(),
    queryFn: getMyNotificationPreferences,
    enabled: !!user,
  });
};

export const useUpdateMyNotificationPreferences = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMyNotificationPreferences,
    onSuccess: (result) => {
      queryClient.setQueryData(usersKeys.notificationPreferences(), result);
    },
  });
};

export const useMyPauseState = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: usersKeys.pauseState(),
    queryFn: getMyPauseState,
    enabled: !!user,
  });
};

export const usePauseMyAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: pauseMyAccount,
    onSuccess: (result) => {
      queryClient.setQueryData(usersKeys.pauseState(), result);
    },
  });
};

export const useReactivateMyAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reactivateMyAccount,
    onSuccess: (result) => {
      queryClient.setQueryData(usersKeys.pauseState(), result);
    },
  });
};

// Not cached as a query — triggered on demand by the "Request" button, and
// re-fetching the same export data on every window refocus would be wasteful.
export const useExportMyData = () => useMutation({ mutationFn: exportMyData });

export const useMyConnections = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: usersKeys.connections(),
    queryFn: listMyConnections,
    enabled: !!user,
  });
};

export const useDisconnectMyConnection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: disconnectMyConnection,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: usersKeys.connections(),
      });
    },
  });
};

export const useMySessions = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: usersKeys.sessions(),
    queryFn: listMySessions,
    enabled: !!user,
  });
};

export const useRevokeMySession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: revokeMySession,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: usersKeys.sessions(),
      });
    },
  });
};

export const useRevokeMyOtherSessions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: revokeMyOtherSessions,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: usersKeys.sessions(),
      });
    },
  });
};
