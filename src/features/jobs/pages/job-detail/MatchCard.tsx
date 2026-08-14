import { Check, Sparkles } from "lucide-react";
import type { MatchResult } from "@/features/matching/match.util";

interface MatchCardProps {
  match: MatchResult;
}

export const MatchCard = ({ match }: MatchCardProps) => (
  <div className="rounded-16 border border-neutral-100 bg-white p-5">
    <div className="mb-3 flex items-center justify-between">
      <h4 className="flex items-center gap-1.5 text-[13px] font-semibold text-neutral-900">
        <Sparkles className="text-brand-600" size={14} />
        Your match
      </h4>
      <span className="text-[15px] font-semibold text-brand-700">
        {match.score}%
      </span>
    </div>
    {match.reasons.length > 0 ? (
      <ul className="space-y-1.5">
        {match.reasons.map((reason) => (
          <li
            className="flex items-start gap-1.5 text-[12.5px] text-neutral-600"
            key={reason}
          >
            <Check className="mt-0.5 flex-shrink-0 text-brand-600" size={12} />
            {reason}
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-[12.5px] text-neutral-400">
        Fill out more of your profile for a better match breakdown.
      </p>
    )}
  </div>
);
