import { cn } from "@/utils/cn";
import { Dropdown } from "@/components/ui/dropdown";
import {
  SORT_OPTIONS,
  type ApplicantSortId,
  type ApplicantTabId,
} from "@/features/employer/employer-dashboard.utils";

export interface ApplicantTabItem {
  id: ApplicantTabId;
  label: string;
  count: number;
}

export interface ApplicantFiltersProps {
  sort: ApplicantSortId;
  onSortChange: (sort: ApplicantSortId) => void;
  tab: ApplicantTabId;
  onTabChange: (tab: ApplicantTabId) => void;
  tabs: ApplicantTabItem[];
}

export const ApplicantFilters = ({
  sort,
  onSortChange,
  tab,
  onTabChange,
  tabs,
}: ApplicantFiltersProps) => {
  return (
    <div className="mb-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h3 className="text-[14px] font-semibold text-neutral-900">
        Recent applicants
      </h3>
      <div className="flex items-center gap-2">
        <Dropdown
          aria-label="Sort applicants"
          options={SORT_OPTIONS}
          value={sort}
          onChange={(v) => onSortChange(v as ApplicantSortId)}
        />
        <div className="flex gap-0.5 rounded-8 border border-neutral-200 bg-neutral-50 p-0.5">
          {tabs.map((t) => (
            <button
              aria-pressed={tab === t.id}
              className={cn(
                "rounded-8 px-2.5 py-1 text-[11.5px] font-medium transition-all focus-visible:shadow-focus focus-visible:outline-none",
                tab === t.id
                  ? "bg-white text-neutral-900 shadow-chip"
                  : "text-neutral-500 hover:text-neutral-700"
              )}
              key={t.id}
              type="button"
              onClick={() => onTabChange(t.id)}
            >
              {t.label}
              <span
                className={cn(
                  "ml-1 rounded-full px-1 py-0.5 text-[10px]",
                  tab === t.id
                    ? "bg-brand-100 text-brand-700"
                    : "bg-neutral-100 text-neutral-400"
                )}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
