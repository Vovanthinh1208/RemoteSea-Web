import { useParams, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { InviteTalentDialog } from "@/features/invitations/InviteTalentDialog";
import { Button } from "@/components/ui/button";
import { ReviewsSection } from "@/features/reviews/components/ReviewsSection";
import { ReviewCTA } from "@/features/reviews/components/ReviewCTA";
import { usePublicTalentProfile } from "@/features/talent/talent.queries";
import { useAuth } from "@/contexts/AuthContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { ProfileSkeleton } from "./public-profile/ProfileSkeleton";
import { RecruiterPreviewBanner } from "./public-profile/RecruiterPreviewBanner";
import { PublicTalentHero } from "./public-profile/PublicTalentHero";
import { PublicTalentAbout } from "./public-profile/PublicTalentAbout";
import { PublicTalentExperience } from "./public-profile/PublicTalentExperience";
import { PublicTalentHighlights } from "./public-profile/PublicTalentHighlights";
import { PublicTalentSidebar } from "./public-profile/PublicTalentSidebar";
import { PublicTalentNotFound } from "./public-profile/PublicTalentNotFound";
import { PublicTalentRestricted } from "./public-profile/PublicTalentRestricted";
import { ApiError } from "@/core/errors/api-error";
import { useTranslation } from "@/i18n/useTranslation";

const MOCK_RECRUITER = { company: "Finch Labs" };
const MOCK_MATCH_SCORE = 94;

export const PublicTalentProfilePage = () => {
  const { t } = useTranslation("talent");
  const [inviting, setInviting] = useState(false);
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const isRecruiterPreview = searchParams.get("preview") === "recruiter";
  const { user } = useAuth();
  const {
    data: profile,
    isLoading,
    isError,
    error,
  } = usePublicTalentProfile(slug);

  useDocumentTitle(
    profile?.user?.name
      ? t("public.docTitle", { name: profile.user.name })
      : t("public.docTitleFallback")
  );

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error instanceof ApiError && error.code === "TALENT_PROFILE_RESTRICTED") {
    return <PublicTalentRestricted />;
  }

  if (isError || !profile) {
    return <PublicTalentNotFound />;
  }

  const name = profile.user?.name ?? t("public.member");
  const isOwnProfile = !!user && profile.userId === user.id;

  const topSkillsLine = profile.skills
    .slice(0, 3)
    .map((s) => s.skill.name)
    .join(" + ");

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-[1200px] px-6 py-10">
        {isRecruiterPreview && (
          <RecruiterPreviewBanner
            company={MOCK_RECRUITER.company}
            matchScore={MOCK_MATCH_SCORE}
            roleTitle={t("public.preview.role")}
            topSkillsLine={topSkillsLine}
          />
        )}

        <PublicTalentHero
          isRecruiterPreview={isRecruiterPreview}
          name={name}
          profile={profile}
        />
        {user?.role === "EMPLOYER" && !isOwnProfile && profile.isOpenToWork && (
          <div className="mb-5">
            <Button onClick={() => setInviting(true)}>
              {t("public.invite")}
            </Button>
          </div>
        )}
        {inviting && (
          <InviteTalentDialog
            talentId={profile.id}
            onClose={() => setInviting(false)}
          />
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-5">
            {user?.role === "EMPLOYER" && !isOwnProfile && (
              <ReviewCTA
                key={profile.userId}
                partnerId={profile.userId}
                revieweeName={name}
              />
            )}
            <ReviewsSection
              categories={[
                {
                  key: "communication",
                  label: t("public.review.communication"),
                },
                {
                  key: "professionalism",
                  label: t("public.review.professionalism"),
                },
                { key: "reliability", label: t("public.review.reliability") },
              ]}
              userId={profile.userId}
            />

            <PublicTalentAbout
              bio={profile.bio}
              currency={profile.currency}
              desiredSalaryMax={profile.desiredSalaryMax}
              desiredSalaryMin={profile.desiredSalaryMin}
              isRecruiterPreview={isRecruiterPreview}
              timezone={profile.timezone}
            />

            <PublicTalentExperience workExperiences={profile.workExperiences} />

            <PublicTalentHighlights
              hasBio={!!profile.bio}
              hasWorkExperiences={profile.workExperiences.length > 0}
              profileHighlights={profile.profileHighlights}
              skills={profile.skills}
            />
          </div>

          <PublicTalentSidebar
            isOwnProfile={isOwnProfile}
            isRecruiterPreview={isRecruiterPreview}
            profile={profile}
            userEmail={user?.email}
          />
        </div>
      </div>
    </div>
  );
};
