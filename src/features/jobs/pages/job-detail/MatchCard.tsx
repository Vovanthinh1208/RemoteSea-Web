import { Check, Sparkles } from "lucide-react";
import type { MatchResult } from "@/features/matching/match.util";
import { cn } from "@/utils/cn";
import { useTranslation } from "@/i18n/useTranslation";

interface MatchCardProps {
  match: MatchResult;
}

export const MatchCard = ({ match }: MatchCardProps) => {
  const { t } = useTranslation("jobs");
  return (
    <div className="rounded-16 border border-neutral-100 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="flex items-center gap-1.5 text-[13px] font-semibold text-neutral-900">
          <Sparkles className="text-brand-600" size={14} />
          {t("matching.yourMatch")}
        </h4>
        <span className="text-[15px] font-semibold text-brand-700">
          {match.score}%
        </span>
      </div>
      <div
        aria-label={t("matching.yourMatch")}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={match.score}
        className="mb-3 h-1.5 overflow-hidden rounded-full bg-neutral-100"
        role="progressbar"
      >
        <div
          className="h-full rounded-full bg-brand-600"
          style={{ width: `${match.score}%` }}
        />
      </div>
      {match.reasons.length > 0 ? (
        <ul className="space-y-1.5">
          {match.reasons.map((reason) => (
            <li
              className="flex items-start gap-1.5 text-[12.5px] text-neutral-600"
              key={reason.key}
            >
              <Check
                className="mt-0.5 flex-shrink-0 text-brand-600"
                size={12}
              />
              {t(reason.key, reason.params)}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[12.5px] text-neutral-400">
          {t("matching.fillProfile")}
        </p>
      )}

      {match.missingSkills.length > 0 && (
        <div className="mt-3 border-t border-neutral-100 pt-3">
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-neutral-400">
            {t("matching.closeGap")}
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {match.missingSkills.map((skill) => (
              <li
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[11px] font-medium",
                  skill.isRequired
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : "border-neutral-200 bg-neutral-50 text-neutral-500"
                )}
                key={skill.id}
                title={
                  skill.isRequired
                    ? t("matching.required")
                    : t("matching.optional")
                }
              >
                {skill.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
