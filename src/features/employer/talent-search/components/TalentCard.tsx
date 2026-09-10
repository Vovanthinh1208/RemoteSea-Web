import { memo } from "react";
import { Link } from "react-router-dom";
import { Check, Clock, Send } from "lucide-react";
import { SalaryBadge } from "@/components/ui/salary-badge";
import { Tag } from "@/components/ui/tag";
import { MatchBadge } from "@/features/matching/MatchBadge";
import type { MatchResult } from "@/features/matching/match.util";
import { AvailabilityBadge } from "@/features/availability/AvailabilityBadge";
import { colorFor } from "@/features/employer/employer-dashboard.utils";
import { personInitial } from "@/utils/name";
import { countryFlag } from "@/utils/color";
import { LEVEL_LABELS } from "@/utils/labels";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";
import type { TalentSearchItem } from "@/types/talent-search";

interface TalentCardProps {
  talent: TalentSearchItem;
  /** Precomputed by TalentSearchBoard (once per job selection, not per card) — see its matchByTalentId. */
  match: MatchResult | undefined;
  /** undefined when no job is selected in "Rank against" — same job context the match badge above uses. */
  onInvite: (() => void) | undefined;
  invited: boolean;
  inviting: boolean;
}

export const TalentCard = memo(function TalentCard({
  talent,
  match,
  onInvite,
  invited,
  inviting,
}: TalentCardProps) {
  const name = talent.user.name ?? "Candidate";
  const initial = personInitial(name);
  const country = talent.country ?? "Remote";

  return (
    <article className="group relative flex items-start gap-4 rounded-12 border border-neutral-100 bg-white p-5 transition-all duration-150 hover:border-neutral-200 hover:shadow-card">
      <div
        className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-10 text-[15px] font-semibold text-white"
        style={{ background: colorFor(name) }}
      >
        {initial}
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-1.5">
          <span className="text-[13px] font-medium text-neutral-600">
            {name}
          </span>
          <span className="text-[13px] text-neutral-400">
            {countryFlag(talent.country)} {country}
          </span>
        </div>

        <h3 className="mb-2 text-[15px] font-semibold leading-snug text-neutral-900">
          <Link
            className="rounded-4 transition-colors after:absolute after:inset-0 focus-visible:shadow-focus focus-visible:outline-none group-hover:text-brand-700"
            to={ROUTES.talentProfile(talent.slug)}
          >
            {talent.headline ?? LEVEL_LABELS[talent.level]}
          </Link>
        </h3>

        <div className="flex flex-wrap items-center gap-1.5">
          <Tag>{LEVEL_LABELS[talent.level]}</Tag>
          {talent.timezone && (
            <Tag>
              <Clock size={11} />
              {talent.timezone}
            </Tag>
          )}
          {talent.skills.slice(0, 4).map(({ skill }) => (
            <Tag key={skill.id}>{skill.name}</Tag>
          ))}
        </div>
      </div>

      <div className="flex flex-shrink-0 flex-col items-end gap-2">
        {match && <MatchBadge match={match} />}
        {/* Talent search already filters to isOpenToWork:true (see
            buildTalentSearchWhere) — always true here, no need to select it. */}
        <AvailabilityBadge isOpenToWork noticePeriod={talent.noticePeriod} />
        <SalaryBadge
          max={talent.desiredSalaryMax}
          min={talent.desiredSalaryMin}
        />
        <button
          className={cn(
            "relative z-10 inline-flex items-center gap-1 rounded-8 px-2 py-1 text-[11px] font-medium transition-colors focus-visible:shadow-focus focus-visible:outline-none disabled:cursor-not-allowed",
            // neutral, not emerald — this button sits right below
            // MatchBadge/AvailabilityBadge on the same card (both already
            // brand-family, see TIER_BADGE_CLASS), so a third unrelated
            // green here reintroduced the exact color-pileup those two
            // were just fixed for. Neutral also reads correctly as "done/
            // inactive," matching this button's disabled state once invited.
            invited
              ? "bg-neutral-100 text-neutral-500"
              : "bg-brand-50 text-brand-700 hover:bg-brand-100 disabled:opacity-50"
          )}
          disabled={!onInvite || invited || inviting}
          title={
            onInvite
              ? undefined
              : "Select a job in “Rank against” above to invite"
          }
          type="button"
          onClick={onInvite}
        >
          {invited ? (
            <>
              <Check size={11} /> Invited
            </>
          ) : (
            <>
              <Send size={11} /> {inviting ? "Sending…" : "Invite to apply"}
            </>
          )}
        </button>
      </div>
    </article>
  );
});
