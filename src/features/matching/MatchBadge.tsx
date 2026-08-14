import { cn } from "@/utils/cn";
import type { MatchResult } from "@/features/matching/match.util";

interface MatchBadgeProps {
  match: MatchResult;
  className?: string;
}

const HIGH_MATCH_THRESHOLD = 75;
const MID_MATCH_THRESHOLD = 50;

const tierClass = (score: number) => {
  if (score >= HIGH_MATCH_THRESHOLD)
    return "border-emerald-100 bg-emerald-50 text-emerald-700";
  if (score >= MID_MATCH_THRESHOLD)
    return "border-brand-100 bg-brand-50 text-brand-700";
  return "border-neutral-200 bg-neutral-100 text-neutral-500";
};

export const MatchBadge = ({ match, className }: MatchBadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium leading-tight",
      tierClass(match.score),
      className
    )}
    title={match.reasons.length ? match.reasons.join(" · ") : undefined}
  >
    {match.score}% match
  </span>
);
