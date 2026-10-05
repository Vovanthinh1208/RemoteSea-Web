import { Briefcase, Clock, MapPin, ShieldCheck, Zap } from "lucide-react";
import { GradientInitial } from "@/components/ui/gradient-initial";
import { AvailabilityBadge } from "@/features/availability/AvailabilityBadge";
import { LEVEL_TO_LABEL } from "@/features/talent/talent.constants";
import { formatSalaryRange } from "@/utils/format";
import { personInitial } from "@/utils/name";
import type { TalentProfile } from "@/types/talent";

interface PublicTalentHeroProps {
  profile: TalentProfile;
  name: string;
  isRecruiterPreview?: boolean;
}

export const PublicTalentHero = ({
  profile,
  name,
  isRecruiterPreview,
}: PublicTalentHeroProps) => {
  return (
    <div className="mb-6 grid gap-6 rounded-24 border border-neutral-100 bg-white p-8 lg:grid-cols-[auto_1fr_auto]">
      <div className="flex flex-col items-center gap-2">
        <div className="relative">
          <GradientInitial className="h-20 w-20 rounded-full text-[26px]">
            {personInitial(name)}
          </GradientInitial>
          {profile.isOpenToWork && (
            <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-brand-500" />
          )}
        </div>
      </div>

      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {profile.isVerified && (
            <span className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-0.5 text-[11.5px] font-medium text-neutral-600">
              <ShieldCheck className="text-brand-600" size={11} /> Verified
            </span>
          )}
          <AvailabilityBadge
            isOpenToWork={profile.isOpenToWork}
            noticePeriod={profile.noticePeriod}
          />
        </div>
        <h1 className="mb-1 text-[32px] font-semibold tracking-tight text-neutral-900">
          {name}
        </h1>
        {profile.headline && (
          <p className="mb-3 text-[16px] text-neutral-500">
            {profile.headline}
          </p>
        )}
        <div className="flex flex-wrap gap-x-5 gap-y-1.5">
          {profile.location && (
            <span className="flex items-center gap-1.5 text-[13px] text-neutral-500">
              <MapPin
                className="flex-shrink-0 text-neutral-400"
                size={12}
              />
              {profile.location}
            </span>
          )}
          {profile.timezone && (
            <span className="flex items-center gap-1.5 text-[13px] text-neutral-500">
              <Clock className="flex-shrink-0 text-neutral-400" size={12} />
              {profile.timezone}
            </span>
          )}
          {profile.yearsExperience !== null && (
            <span className="flex items-center gap-1.5 text-[13px] text-neutral-500">
              <Briefcase
                className="flex-shrink-0 text-neutral-400"
                size={12}
              />
              {profile.yearsExperience}+ yrs experience
            </span>
          )}
          {/* No icon here — ShieldCheck is already the page's
              "Verified" badge above; reusing it for seniority level
              gave the same glyph two unrelated meanings on one screen,
              and no other icon in this row's set means "level" without
              being just as arbitrary. */}
          <span className="text-[13px] text-neutral-500">
            {LEVEL_TO_LABEL[profile.level] ?? profile.level}
          </span>
          {isRecruiterPreview && (
            <>
              <span className="flex items-center gap-1.5 text-[13px] text-neutral-500">
                <Zap className="flex-shrink-0 text-neutral-400" size={12} />
                Replies in ~6h
              </span>
              <span className="text-[13px] text-neutral-500">
                Active today
              </span>
            </>
          )}
        </div>
      </div>

      {profile.desiredSalaryMin && profile.desiredSalaryMax && (
        <div className="min-w-[200px] rounded-16 border border-neutral-100 bg-neutral-50 p-5">
          <p className="mb-1 text-[10.5px] font-semibold uppercase tracking-wider text-neutral-400">
            Expecting
          </p>
          <p className="text-[26px] font-semibold leading-tight tracking-tight text-neutral-900">
            {formatSalaryRange(
              profile.desiredSalaryMin,
              profile.desiredSalaryMax
            )}
            <span className="ml-1 text-[14px] font-normal text-neutral-400">
              {" "}
              / mo
            </span>
          </p>
          <p className="text-[12px] text-neutral-500">{profile.currency}</p>
          {isRecruiterPreview && (
            <div className="mt-3">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
                <div className="h-full w-2/3 rounded-full bg-brand-500" />
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-neutral-400">
                <span>VN median</span>
                <span>SG market</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
