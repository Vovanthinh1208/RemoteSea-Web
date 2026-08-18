import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  confirmTalentVerification,
  getMyTalentProfile,
  getPublicTalentProfile,
  submitTalentVerification,
  updateMyTalentProfile,
} from "@/features/talent/talent.service";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/core/errors/api-error";
import { talentKeys } from "@/core/query/query-keys";

const NOT_FOUND_STATUS = 404;

export const MY_TALENT_PROFILE_KEY = talentKeys.mine();

export const useMyTalentProfile = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: talentKeys.mine(),
    queryFn: async ({ signal }) => {
      try {
        return await getMyTalentProfile({ signal });
      } catch (err) {
        if (err instanceof ApiError && err.status === NOT_FOUND_STATUS)
          return null;
        throw err;
      }
    },
    enabled: !!user,
  });
};

export const useUpdateMyTalentProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMyTalentProfile,
    onSuccess: (profile) => {
      queryClient.setQueryData(talentKeys.mine(), profile);
      // The public profile page supports viewing your own profile — without
      // this, editing and then clicking through to your own public URL shows
      // stale data for up to staleTime.
      queryClient.invalidateQueries({
        queryKey: talentKeys.public(profile.slug),
      });
    },
  });
};

export const usePublicTalentProfile = (slug: string | undefined) =>
  useQuery({
    queryKey: talentKeys.public(slug),
    queryFn: ({ signal }) => getPublicTalentProfile(slug as string, { signal }),
    enabled: !!slug,
  });

export const useSubmitTalentVerification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitTalentVerification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: talentKeys.mine() });
    },
  });
};

export const useConfirmTalentVerification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: confirmTalentVerification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: talentKeys.mine() });
      // Confirming flips the publicly-exposed `isVerified` flag, but this
      // mutation only returns a message (no slug to target). Invalidate by
      // prefix so any mounted public-profile query (own slug unknown here)
      // still picks up the change instead of showing a stale badge for up
      // to staleTime — same problem useUpdateMyTalentProfile solves above.
      queryClient.invalidateQueries({ queryKey: talentKeys.publicAll() });
    },
  });
};
