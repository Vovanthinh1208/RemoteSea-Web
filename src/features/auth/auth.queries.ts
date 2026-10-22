import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  disableTwoFactor,
  getOAuthProviders,
  getTwoFactorStatus,
  setupTwoFactor,
  verifyTwoFactorSetup,
} from "@/features/auth/auth.service";
import { useAuth } from "@/contexts/AuthContext";
import { authKeys } from "@/core/query/query-keys";

export const useTwoFactorStatus = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: authKeys.twoFactorStatus(),
    queryFn: getTwoFactorStatus,
    enabled: !!user,
  });
};

export const useOAuthProviders = () =>
  useQuery({
    queryKey: authKeys.oauthProviders(),
    queryFn: getOAuthProviders,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

export const useSetupTwoFactor = () =>
  useMutation({ mutationFn: setupTwoFactor });

export const useVerifyTwoFactorSetup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: verifyTwoFactorSetup,
    onSuccess: () => {
      queryClient.setQueryData(authKeys.twoFactorStatus(), {
        enabled: true,
      });
    },
  });
};

export const useDisableTwoFactor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: disableTwoFactor,
    onSuccess: () => {
      queryClient.setQueryData(authKeys.twoFactorStatus(), {
        enabled: false,
      });
    },
  });
};
