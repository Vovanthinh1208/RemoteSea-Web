import { useParams, useSearchParams } from "react-router-dom";
import { ReviewsSection } from "@/features/reviews/components/ReviewsSection";
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

const MOCK_RECRUITER = {
  company: "Finch Labs",
  roleTitle: "Senior Full-stack Engineer",
};
const MOCK_MATCH_SCORE = 94;

const TALENT_REVIEW_CATEGORIES = [
  { key: "communication", label: "Communication" },
  { key: "professionalism", label: "Professionalism" },
  { key: "reliability", label: "Reliability" },
] as const;

export const PublicTalentProfilePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const isRecruiterPreview = searchParams.get("preview") === "recruiter";
  const { user } = useAuth();
  const { data: profile, isLoading, isError } = usePublicTalentProfile(slug);

  useDocumentTitle(
    profile?.user?.name
      ? `${profile.user.name} — Talent Profile`
      : "Talent Profile"
  );

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (isError || !profile) {
    return <PublicTalentNotFound />;
  }

  const name = profile.user?.name ?? "RemoteSEA member";
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
            roleTitle={MOCK_RECRUITER.roleTitle}
            topSkillsLine={topSkillsLine}
          />
        )}

        <PublicTalentHero
          isRecruiterPreview={isRecruiterPreview}
          name={name}
          profile={profile}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-5">
            <ReviewsSection
              categories={TALENT_REVIEW_CATEGORIES}
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

            <PublicTalentExperience
              workExperiences={profile.workExperiences}
            />

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
