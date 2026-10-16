import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";
import { useSkills } from "@/features/taxonomy/taxonomy.queries";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { FilterGroup } from "@/components/shared/FilterGroup";
import { CheckRow } from "@/components/shared/CheckRow";
import {
  COUNTRY_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  LEVEL_OPTIONS,
  TIMEZONE_OVERLAP_OPTIONS,
  countActiveTalentFilters,
  type TalentSearchFilters,
} from "@/features/employer/talent-search/talent-search.filters";
import { NOTICE_PERIOD_OPTIONS } from "@/features/talent/talent.constants";
import { LEVEL_LABELS } from "@/utils/labels";
import { useTranslation } from "@/i18n/useTranslation";
import { optionLabel } from "@/i18n/labels";

interface TalentFilterSidebarProps {
  filters: TalentSearchFilters;
  onChange: (filters: TalentSearchFilters) => void;
}

const SKILL_SUGGESTION_LIMIT = 8;

export const TalentFilterSidebar = ({
  filters,
  onChange,
}: TalentFilterSidebarProps) => {
  const { t } = useTranslation("employer");
  const [skillQuery, setSkillQuery] = useState("");
  // The input stays fully responsive to every keystroke; only the query
  // itself (GET /skills?q=...) waits for typing to pause — without this,
  // typing e.g. "JavaScript" fired 10 separate server requests, one per
  // keystroke, each racing the next.
  const debouncedSkillQuery = useDebouncedValue(skillQuery);
  const { data: allSkills } = useSkills(debouncedSkillQuery);
  const skillOptions = (allSkills ?? []).slice(0, SKILL_SUGGESTION_LIMIT);
  const activeCount = countActiveTalentFilters(filters);
  // Mobile only — same fix as jobs/FilterSidebar.tsx (identical bug: six
  // filter groups, one with its own search input, rendered full-height
  // inline above the talent list on a phone with no way to collapse them).
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggle = <
    K extends
      | "level"
      | "country"
      | "employmentTypes"
      | "timezoneOverlap"
      | "noticePeriod",
  >(
    key: K,
    val: TalentSearchFilters[K][number]
  ) => {
    const current = filters[key] as TalentSearchFilters[K][number][];
    const exists = current.some((v) => v === val);
    onChange({
      ...filters,
      [key]: exists ? current.filter((v) => v !== val) : [...current, val],
    });
  };

  const toggleSkill = (skillId: string) => {
    onChange({
      ...filters,
      skills: filters.skills.includes(skillId)
        ? filters.skills.filter((s) => s !== skillId)
        : [...filters.skills, skillId],
    });
  };

  return (
    <aside className="w-full flex-shrink-0 sm:w-[220px]">
      <div className="flex items-center justify-between">
        <button
          aria-controls="talent-filter-groups"
          aria-expanded={mobileOpen}
          className="-my-1 flex items-center gap-2 rounded-8 py-1 focus-visible:shadow-focus focus-visible:outline-none sm:pointer-events-none"
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <h3 className="text-[15px] font-semibold text-neutral-900">
            {t("common.actions.filters")}
          </h3>
          {activeCount > 0 && (
            <span className="grid h-4 w-4 place-items-center rounded-full bg-brand-600 text-[11px] font-semibold text-white">
              {activeCount}
            </span>
          )}
          <ChevronDown
            className={cn(
              "h-4 w-4 flex-shrink-0 text-neutral-400 transition-transform sm:hidden",
              mobileOpen && "rotate-180"
            )}
          />
        </button>
        <button
          type="button"
          className={cn(
            "rounded-4 text-[12px] text-brand-600 transition-colors hover:text-brand-700 focus-visible:shadow-focus focus-visible:outline-none",
            activeCount > 0 ? "visible pt-[3px]" : "invisible"
          )}
          onClick={() =>
            onChange({
              ...filters,
              skills: [],
              level: [],
              country: [],
              employmentTypes: [],
              timezoneOverlap: [],
              noticePeriod: [],
            })
          }
        >
          {t("jobs.filters.clearAll")}
        </button>
      </div>

      <div
        className={cn(mobileOpen ? "block" : "hidden", "sm:!block")}
        id="talent-filter-groups"
      >
        <FilterGroup label={t("filter.skills")}>
          <input
            className="mb-2 w-full rounded-8 border border-neutral-200 px-2.5 py-1.5 text-[13px] outline-none focus:border-brand-600"
            placeholder={t("filter.skillsSearch")}
            type="text"
            value={skillQuery}
            onChange={(e) => setSkillQuery(e.target.value)}
          />
          {skillOptions.map((skill) => (
            <CheckRow
              checked={filters.skills.includes(skill.id)}
              key={skill.id}
              label={skill.name}
              onToggle={() => toggleSkill(skill.id)}
            />
          ))}
        </FilterGroup>

        <FilterGroup label={t("filter.availability")}>
          {NOTICE_PERIOD_OPTIONS.map((notice) => (
            <CheckRow
              checked={filters.noticePeriod.includes(notice)}
              key={notice}
              label={
                notice === "Immediate"
                  ? t("talent.availability.now")
                  : optionLabel("talent.opt.notice", notice)
              }
              onToggle={() => toggle("noticePeriod", notice)}
            />
          ))}
        </FilterGroup>

        <FilterGroup label={t("filter.seniority")}>
          {LEVEL_OPTIONS.map((level) => (
            <CheckRow
              checked={filters.level.includes(level)}
              key={level}
              label={LEVEL_LABELS[level]}
              onToggle={() => toggle("level", level)}
            />
          ))}
        </FilterGroup>

        <FilterGroup label={t("filter.employment")}>
          {EMPLOYMENT_TYPE_OPTIONS.map((type) => (
            <CheckRow
              checked={filters.employmentTypes.includes(type)}
              key={type}
              label={t(`filter.type.${type}`)}
              onToggle={() => toggle("employmentTypes", type)}
            />
          ))}
        </FilterGroup>

        <FilterGroup label={t("filter.tzOverlap")}>
          {TIMEZONE_OVERLAP_OPTIONS.map((tz) => (
            <CheckRow
              checked={filters.timezoneOverlap.includes(tz)}
              key={tz}
              label={t(`filter.${tz}`)}
              onToggle={() => toggle("timezoneOverlap", tz)}
            />
          ))}
        </FilterGroup>

        <FilterGroup label={t("filter.country")}>
          {COUNTRY_OPTIONS.map((country) => (
            <CheckRow
              checked={filters.country.includes(country)}
              key={country}
              label={optionLabel("employer.country", country)}
              onToggle={() => toggle("country", country)}
            />
          ))}
        </FilterGroup>
      </div>
    </aside>
  );
};
