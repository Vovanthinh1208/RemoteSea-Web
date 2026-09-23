import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/constants/routes";
import { formatSalaryRange } from "@/utils/format";
import { GradientInitial } from "@/components/ui/gradient-initial";
import type { TalentProfile } from "@/types/talent";

type ProfileSnapshotProps = {
  profile: TalentProfile | null;
};

// Presentational — TalentDashboard (its only caller) now sources this from
// useTalentDashboard's single aggregate request instead of this component
// firing its own useMyTalentProfile() call.
export const ProfileSnapshot = ({ profile }: ProfileSnapshotProps) => {
  const { user } = useAuth();

  return (
    <div className="mb-5 overflow-hidden rounded-16 border border-neutral-100 bg-white shadow-card">
      <div className="flex flex-col items-center p-5 text-center">
        <GradientInitial className="mb-3 h-14 w-14 rounded-full text-lg">
          {(user?.name ?? "?").charAt(0).toUpperCase()}
        </GradientInitial>
        <h3 className="text-[15px] font-semibold text-neutral-900">
          {user?.name}
        </h3>
        <p className="mt-0.5 text-[12.5px] text-neutral-400">
          {profile?.headline || "No headline yet"}
        </p>
        <Link
          className="mt-3 inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-8 border border-neutral-200 text-[12.5px] font-medium text-neutral-700 transition-colors hover:bg-neutral-50 focus-visible:shadow-focus focus-visible:outline-none"
          to={ROUTES.profile}
        >
          Edit profile <ArrowRight size={12} />
        </Link>
      </div>
      {/* Plain label/value rows, no icons — matches the same class of
          metadata on the public profile's own Quick Facts panel
          (PublicTalentProfilePage.tsx), where "Based in"/"Timezone" already
          say what they are; MapPin/Clock/Briefcase added no information the
          label didn't already state. */}
      <div className="border-t border-neutral-100">
        {[
          {
            label: "Based in",
            value: profile?.location || "—",
          },
          {
            label: "Timezone",
            value: profile?.timezone || "—",
          },
          {
            label: "Expecting",
            value:
              profile?.desiredSalaryMin && profile.desiredSalaryMax
                ? `${formatSalaryRange(profile.desiredSalaryMin, profile.desiredSalaryMax)}/mo`
                : "—",
          },
        ].map(({ label, value }) => (
          <div
            className="flex items-center justify-between border-b border-neutral-50 px-4 py-2.5 last:border-none"
            key={label}
          >
            <span className="text-[12px] text-neutral-400">{label}</span>
            <span className="text-[12px] font-medium text-neutral-700">
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
