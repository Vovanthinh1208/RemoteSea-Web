import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";
import { useSkills } from "@/features/taxonomy/taxonomy.queries";
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

interface TalentFilterSidebarProps {
  filters: TalentSearchFilters;
  onChange: (filters: TalentSearchFilters) => void;
}

interface CheckRowProps {
  checked: boolean;
  label: string;
  onToggle: () => void;
}

const CheckRow = ({ checked, label, onToggle }: CheckRowProps) => (
  <label
    className={cn(
      "flex cursor-pointer select-none items-center gap-2.5 py-1.5 text-[13.5px] transition-colors",
      checked ? "text-neutral-900" : "text-neutral-500 hover:text-neutral-900"
    )}
  >
    <input
      checked={checked}
      className="peer sr-only"
      type="checkbox"
      onChange={onToggle}
    />
    <span
      aria-hidden="true"
      className={cn(
        "grid h-4 w-4 flex-shrink-0 place-items-center rounded-4 border transition-all",
        "peer-focus-visible:shadow-focus",
        checked
          ? "border-brand-600 bg-brand-600"
          : "border-neutral-300 bg-white"
      )}
    >
      {checked && <Check className="text-white" size={10} strokeWidth={3} />}
    </span>
    <span className="flex-1">{label}</span>
  </label>
);

interface FilterGroupProps {
  label: string;
  children: React.ReactNode;
}

const FilterGroup = ({ label, children }: FilterGroupProps) => (
  <div className="border-b border-neutral-100 py-4 last:border-0">
    <div className="mb-2 text-[10.5px] font-semibold uppercase tracking-widest text-neutral-400">
      {label}
    </div>
    {children}
  </div>
);

const SKILL_SUGGESTION_LIMIT = 8;

const TIMEZONE_OVERLAP_LABELS: Record<
  (typeof TIMEZONE_OVERLAP_OPTIONS)[number],
  string
> = {
  SG_HOURS: "SG hours",
  AU_HOURS: "AU hours",
  ASYNC_ONLY: "Async-friendly",
};

export const TalentFilterSidebar = ({
  filters,
  onChange,
}: TalentFilterSidebarProps) => {
  const [skillQuery, setSkillQuery] = useState("");
  const { data: allSkills } = useSkills(skillQuery);
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
          className="-my-1 flex items-center gap-2 py-1 sm:pointer-events-none"
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <h3 className="text-[15px] font-semibold text-neutral-900">
            Filters
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
            "text-[12px] text-brand-600 transition-colors hover:text-brand-700",
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
          Clear all
        </button>
      </div>

      <div
        className={cn(mobileOpen ? "block" : "hidden", "sm:!block")}
        id="talent-filter-groups"
      >
        <FilterGroup label="Skills">
          <input
            className="mb-2 w-full rounded-8 border border-neutral-200 px-2.5 py-1.5 text-[13px] outline-none focus:border-brand-600"
            placeholder="Search skills…"
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

        <FilterGroup label="Availability">
          {NOTICE_PERIOD_OPTIONS.map((notice) => (
            <CheckRow
              checked={filters.noticePeriod.includes(notice)}
              key={notice}
              label={notice === "Immediate" ? "Available now" : notice}
              onToggle={() => toggle("noticePeriod", notice)}
            />
          ))}
        </FilterGroup>

        <FilterGroup label="Seniority">
          {LEVEL_OPTIONS.map((level) => (
            <CheckRow
              checked={filters.level.includes(level)}
              key={level}
              label={LEVEL_LABELS[level]}
              onToggle={() => toggle("level", level)}
            />
          ))}
        </FilterGroup>

        <FilterGroup label="Employment type">
          {EMPLOYMENT_TYPE_OPTIONS.map((type) => (
            <CheckRow
              checked={filters.employmentTypes.includes(type)}
              key={type}
              label={type.replace("_", "-")}
              onToggle={() => toggle("employmentTypes", type)}
            />
          ))}
        </FilterGroup>

        <FilterGroup label="Timezone overlap">
          {TIMEZONE_OVERLAP_OPTIONS.map((tz) => (
            <CheckRow
              checked={filters.timezoneOverlap.includes(tz)}
              key={tz}
              label={TIMEZONE_OVERLAP_LABELS[tz]}
              onToggle={() => toggle("timezoneOverlap", tz)}
            />
          ))}
        </FilterGroup>

        <FilterGroup label="Country">
          {COUNTRY_OPTIONS.map((country) => (
            <CheckRow
              checked={filters.country.includes(country)}
              key={country}
              label={country}
              onToggle={() => toggle("country", country)}
            />
          ))}
        </FilterGroup>
      </div>
    </aside>
  );
};
