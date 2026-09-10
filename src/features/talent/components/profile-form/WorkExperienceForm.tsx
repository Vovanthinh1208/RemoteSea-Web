import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Briefcase, Building2, MapPin } from "lucide-react";
import { Toggle } from "@/features/talent/components/profile-form/Toggle";
import {
  TEXT_INPUT_CLASS,
  TEXTAREA_INPUT_CLASS,
} from "@/components/shared/input-styles";
import {
  isoDateToMonth,
  workExperienceFormSchema,
  type WorkExperienceFormValues,
} from "@/features/talent/work-experience.schemas";
import type { WorkExperience } from "@/types/work-experience";

interface WorkExperienceFormProps {
  initial?: WorkExperience;
  onSubmit: (values: WorkExperienceFormValues) => Promise<boolean>;
  onCancel: () => void;
}

const MAX_DESCRIPTION_LENGTH = 1000;

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const CURRENT_YEAR = new Date().getUTCFullYear();
// A career spanning up to 60 years back covers this app's users; a couple of
// years ahead allows an already-scheduled future start date.
const YEARS = Array.from({ length: 62 }, (_, i) => CURRENT_YEAR + 1 - i);

interface MonthYearSelectProps {
  value: string; // "YYYY-MM", or "" when incomplete
  onChange: (value: string) => void;
  disabled?: boolean;
  ariaLabelPrefix: string;
  autoFocus?: boolean;
}

// Two plain <select>s, not <input type="month"> — the native month picker
// renders as a tiny, inconsistently-styled OS widget that clashes with every
// other (custom-styled) control on this form. Kept fully local: an
// in-progress "month picked, year not yet" selection can't be represented by
// the single combined string the parent field expects, so this only calls
// onChange once both parts are known (and clears the parent field, forcing
// re-validation, the moment either part is emptied out).
const MonthYearSelect = ({
  value,
  onChange,
  disabled,
  ariaLabelPrefix,
  autoFocus,
}: MonthYearSelectProps) => {
  const [initialYear, initialMonth] = value ? value.split("-") : ["", ""];
  const [month, setMonth] = useState(initialMonth);
  const [year, setYear] = useState(initialYear);

  const emit = (nextMonth: string, nextYear: string) =>
    onChange(nextMonth && nextYear ? `${nextYear}-${nextMonth}` : "");

  return (
    <div className="grid grid-cols-2 gap-2">
      <select
        aria-label={`${ariaLabelPrefix} month`}
        autoFocus={autoFocus}
        className={TEXT_INPUT_CLASS}
        disabled={disabled}
        value={month}
        onChange={(e) => {
          setMonth(e.target.value);
          emit(e.target.value, year);
        }}
      >
        <option value="">Month</option>
        {MONTHS.map((name, i) => (
          <option key={name} value={String(i + 1).padStart(2, "0")}>
            {name}
          </option>
        ))}
      </select>
      <select
        aria-label={`${ariaLabelPrefix} year`}
        className={TEXT_INPUT_CLASS}
        disabled={disabled}
        value={year}
        onChange={(e) => {
          setYear(e.target.value);
          emit(month, e.target.value);
        }}
      >
        <option value="">Year</option>
        {YEARS.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
};

const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <p className="mt-1 flex items-center gap-1 text-[11.5px] text-red-600">
      <AlertCircle size={11} /> {message}
    </p>
  ) : null;

const toDefaultValues = (
  initial?: WorkExperience
): WorkExperienceFormValues => ({
  company: initial?.company ?? "",
  title: initial?.title ?? "",
  location: initial?.location ?? "",
  startMonth: initial ? isoDateToMonth(initial.startDate) : "",
  isCurrent: initial ? initial.endDate === null : true,
  endMonth: initial?.endDate ? isoDateToMonth(initial.endDate) : "",
  description: initial?.description ?? "",
});

export const WorkExperienceForm = ({
  initial,
  onSubmit,
  onCancel,
}: WorkExperienceFormProps) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<WorkExperienceFormValues>({
    resolver: zodResolver(workExperienceFormSchema),
    defaultValues: toDefaultValues(initial),
  });

  const [isCurrent, startMonth, endMonth, description] = watch([
    "isCurrent",
    "startMonth",
    "endMonth",
    "description",
  ]);

  return (
    <form
      className="animate-fade-up space-y-4 rounded-16 border border-neutral-100 bg-white p-4 sm:p-5"
      onSubmit={handleSubmit(async (values) => {
        const ok = await onSubmit(values);
        if (ok) onCancel();
      })}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-10 bg-neutral-100 text-neutral-500">
            <Building2 size={15} />
          </span>
          <div className="min-w-0 flex-1">
            <input
              aria-label="Company"
              autoFocus={!initial}
              className={TEXT_INPUT_CLASS}
              placeholder="Company"
              {...register("company")}
            />
            <FieldError message={errors.company?.message} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-10 bg-neutral-100 text-neutral-500">
            <Briefcase size={15} />
          </span>
          <div className="min-w-0 flex-1">
            <input
              aria-label="Job title"
              className={TEXT_INPUT_CLASS}
              placeholder="Job title"
              {...register("title")}
            />
            <FieldError message={errors.title?.message} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-10 bg-neutral-100 text-neutral-500">
          <MapPin size={15} />
        </span>
        <input
          aria-label="Location"
          className={TEXT_INPUT_CLASS}
          placeholder="Location (optional) — e.g. Singapore"
          {...register("location")}
        />
      </div>

      <div className="grid gap-4 rounded-12 border border-neutral-100 bg-white p-3.5 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 pt-1.5 text-[11.5px] font-medium text-neutral-600">
            Start date
          </p>
          <MonthYearSelect
            ariaLabelPrefix="Start"
            value={startMonth}
            onChange={(v) =>
              setValue("startMonth", v, { shouldValidate: true })
            }
          />
          <FieldError message={errors.startMonth?.message} />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-[11.5px] font-medium text-neutral-600">
              End date
            </p>
            <label className="flex items-center gap-1.5 text-[11px] text-neutral-500">
              Current role
              <Toggle
                on={isCurrent}
                onChange={(v) =>
                  setValue("isCurrent", v, { shouldValidate: true })
                }
              />
            </label>
          </div>
          <MonthYearSelect
            ariaLabelPrefix="End"
            disabled={isCurrent}
            value={isCurrent ? "" : (endMonth ?? "")}
            onChange={(v) => setValue("endMonth", v, { shouldValidate: true })}
          />
          <FieldError message={errors.endMonth?.message} />
        </div>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label
            className="text-[12px] font-medium text-neutral-600"
            htmlFor="we-description"
          >
            What did you work on?{" "}
            <span className="font-normal text-neutral-400">(optional)</span>
          </label>
          <span className="text-[11px] text-neutral-400">
            {description?.length ?? 0} / {MAX_DESCRIPTION_LENGTH}
          </span>
        </div>
        <textarea
          className={TEXTAREA_INPUT_CLASS}
          id="we-description"
          placeholder="A sentence or two on your impact — recruiters skim this."
          rows={3}
          {...register("description")}
        />
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          className="rounded-10 bg-brand-600 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-brand-700 focus-visible:shadow-focus focus-visible:outline-none disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Saving…" : initial ? "Save changes" : "Add role"}
        </button>
        <button
          className="rounded-10 border border-neutral-200 bg-white px-4 py-2 text-[13px] font-medium text-neutral-600 transition-colors hover:border-neutral-300 focus-visible:shadow-focus focus-visible:outline-none"
          type="button"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
