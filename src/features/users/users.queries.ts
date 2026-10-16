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
import { talentKeys, usersKeys } from "@/core/query/query-keys";
import type { TalentProfile } from "@/types/talent";

export const useUpdateMyName = () => {
  const { patchUser } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMyName,
    onSuccess: (result) => {
      patchUser({ name: result.name });
      // Keep the cached own-profile in step, so the profile form (which seeds
      // its name field from `profile.user.name`) doesn't snap back to the old name.
      queryClient.setQueryData<TalentProfile>(talentKeys.mine(), (previous) =>
        previous
          ? { ...previous, user: { ...previous.user, name: result.name } }
          : previous
      );
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
  const { logout } = useAuth();
  return useMutation({
    mutationFn: pauseMyAccount,
    onSuccess: (result) => {
      queryClient.setQueryData(usersKeys.pauseState(), result);
      // PB16 step 4: pausing signs the user out (the server has already
      // revoked every session); signing back in offers "Reactivate".
      logout();
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
