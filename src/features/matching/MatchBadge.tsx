import { cn } from "@/utils/cn";
import { TIER_BADGE_CLASS } from "@/utils/color";
import type { MatchResult } from "@/features/matching/match.util";

interface MatchBadgeProps {
  match: MatchResult;
  className?: string;
}

const HIGH_MATCH_THRESHOLD = 75;
const MID_MATCH_THRESHOLD = 50;

const tierClass = (score: number) => {
  if (score >= HIGH_MATCH_THRESHOLD) return TIER_BADGE_CLASS.high;
  if (score >= MID_MATCH_THRESHOLD) return TIER_BADGE_CLASS.mid;
  return TIER_BADGE_CLASS.low;
};

const tooltipFor = (match: MatchBadgeProps["match"]): string | undefined => {
  const parts = [...match.reasons];
  const requiredGaps = match.missingSkills.filter((s) => s.isRequired);
  if (requiredGaps.length > 0) {
    parts.push(`Missing: ${requiredGaps.map((s) => s.name).join(", ")}`);
  }
  return parts.length ? parts.join(" · ") : undefined;
};

export const MatchBadge = ({ match, className }: MatchBadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium leading-tight",
      tierClass(match.score),
      className
    )}
    title={tooltipFor(match)}
  >
    {match.score}% match
  </span>
);
