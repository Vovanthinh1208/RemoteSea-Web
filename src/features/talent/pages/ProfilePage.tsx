import { ProfileForm } from "@/features/talent/components/ProfileForm";
import { useMyTalentProfile } from "@/features/talent/talent.queries";
import { FullPageLoader } from "@/components/ui/spinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useTranslation } from "@/i18n/useTranslation";

export const ProfilePage = () => {
  const { t } = useTranslation("talent");
  useDocumentTitle(t("page.profileSetup"));
  const { data: profile, isLoading, isError, refetch } = useMyTalentProfile();

  if (isLoading) return <FullPageLoader />;

  // Without this, any fetch failure (network blip, a stale-role edge case) was
  // silently treated the same as "no profile yet" and rendered the creation
  // form — which then fails confusingly on submit instead of showing an error.
  if (isError) {
    return (
      <EmptyState
        action={
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            {t("common.actions.retry")}
          </Button>
        }
        description={t("page.loadErrorDesc")}
        title={t("page.loadError")}
      />
    );
  }

  return <ProfileForm profile={profile ?? null} />;
};
