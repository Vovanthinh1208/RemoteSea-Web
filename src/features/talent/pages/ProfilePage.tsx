import { ProfileForm } from "@/features/talent/components/ProfileForm";
import { useMyTalentProfile } from "@/features/talent/talent.queries";
import { FullPageLoader } from "@/components/ui/spinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export const ProfilePage = () => {
  useDocumentTitle("Profile Setup");
  const {
    data: profile,
    isLoading,
    isError,
    refetch,
  } = useMyTalentProfile();

  if (isLoading) return <FullPageLoader />;

  // Without this, any fetch failure (network blip, a stale-role edge case) was
  // silently treated the same as "no profile yet" and rendered the creation
  // form — which then fails confusingly on submit instead of showing an error.
  if (isError) {
    return (
      <EmptyState
        action={
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
          >
            Try again
          </Button>
        }
        description="Something went wrong loading your profile."
        title="Couldn't load profile"
      />
    );
  }

  return <ProfileForm profile={profile ?? null} />;
};
