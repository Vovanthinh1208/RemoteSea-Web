import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  confirmTalentVerification,
  getMyTalentProfile,
  getProfileViewAnalytics,
  getPublicTalentProfile,
  getTalentDashboard,
  submitTalentVerification,
  updateMyTalentProfile,
} from "@/features/talent/talent.service";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/core/errors/api-error";
import {
  activityKeys,
  alertKeys,
  applicationKeys,
  invitationKeys,
  savedKeys,
  talentKeys,
} from "@/core/query/query-keys";
import { TIER } from "@/core/query/query-client";

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

// Deliberately not in TalentDashboard's blocking loading gate — same
// "streams in on its own, shows '—' until then" treatment as
// useSavedJobIds, since it backs one secondary KPI tile, not the page.
export const useProfileViewAnalytics = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: talentKeys.profileViews(),
    queryFn: ({ signal }) => getProfileViewAnalytics({ signal }),
    enabled: !!user,
  });
};

// Matches TalentService's own DASHBOARD_APPLICATIONS_LIMIT.
const DASHBOARD_APPLICATIONS_LIMIT = 50;

// Backs the dashboard screen with one request instead of the eight
// (useMyApplications/useMyApplicationStats/useMyTalentProfile/
// useSavedJobIds/useProfileViewAnalytics/useAlerts/useMyInvitations/
// useTalentActivity each firing separately — see GET /talent/me/dashboard).
// Also seeds each of those eight queries' own caches on success, so any of
// those hooks — if ever used independently elsewhere — gets an instant
// cache hit instead of re-fetching, within TIER.live's staleness window.
export const useTalentDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: talentKeys.dashboard(),
    queryFn: async ({ signal }) => {
      const dashboard = await getTalentDashboard({ signal });
      queryClient.setQueryData(talentKeys.mine(), dashboard.profile);
      queryClient.setQueryData(
        applicationKeys.mine(1, DASHBOARD_APPLICATIONS_LIMIT),
        dashboard.applications
      );
      queryClient.setQueryData(
        applicationKeys.stats(),
        dashboard.applicationStats
      );
      queryClient.setQueryData(savedKeys.ids(), dashboard.savedJobIds);
      queryClient.setQueryData(
        talentKeys.profileViews(),
        dashboard.profileViewAnalytics
      );
      queryClient.setQueryData(alertKeys.all, dashboard.alerts);
      queryClient.setQueryData(invitationKeys.mine(), dashboard.invitations);
      queryClient.setQueryData(activityKeys.mine(), dashboard.activity);
      return dashboard;
    },
    enabled: !!user,
    ...TIER.live,
  });

  return {
    profile: data?.profile ?? null,
    applications: data?.applications ?? null,
    applicationStats: data?.applicationStats ?? null,
    savedJobIds: data?.savedJobIds ?? null,
    profileViewAnalytics: data?.profileViewAnalytics ?? null,
    alerts: data?.alerts ?? null,
    invitations: data?.invitations ?? null,
    activity: data?.activity ?? null,
    isLoading,
    isError,
    refetch,
  };
};
