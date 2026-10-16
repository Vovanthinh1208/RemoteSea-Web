import { useState } from "react";
import { InlineForm } from "@/features/talent/components/profile-form/InlineForm";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Briefcase, Building2, MapPin } from "lucide-react";
import { Toggle } from "@/features/talent/components/profile-form/Toggle";
import { FieldError } from "@/components/shared/FieldError";
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
import { useTranslation } from "@/i18n/useTranslation";
import { useRevalidateOnLocaleChange } from "@/i18n/useRevalidateOnLocaleChange";

interface WorkExperienceFormProps {
  initial?: WorkExperience;
  onSubmit: (values: WorkExperienceFormValues) => Promise<boolean>;
  onCancel: () => void;
}

const MAX_DESCRIPTION_LENGTH = 1000;

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
  const { t, formatDate } = useTranslation("talent");
  const [initialYear, initialMonth] = value ? value.split("-") : ["", ""];
  const [month, setMonth] = useState(initialMonth);
  const [year, setYear] = useState(initialYear);

  const emit = (nextMonth: string, nextYear: string) =>
    onChange(nextMonth && nextYear ? `${nextYear}-${nextMonth}` : "");

  return (
    <div className="grid grid-cols-2 gap-2">
      <select
        aria-label={t("expForm.monthAria", { prefix: ariaLabelPrefix })}
        autoFocus={autoFocus}
        className={TEXT_INPUT_CLASS}
        disabled={disabled}
        value={month}
        onChange={(e) => {
          setMonth(e.target.value);
          emit(e.target.value, year);
        }}
      >
        <option value="">{t("expForm.month")}</option>
        {Array.from({ length: 12 }, (_, i) => (
          <option key={i} value={String(i + 1).padStart(2, "0")}>
            {formatDate(new Date(Date.UTC(2000, i, 1)), {
              month: "long",
              timeZone: "UTC",
            })}
          </option>
        ))}
      </select>
      <select
        aria-label={t("expForm.yearAria", { prefix: ariaLabelPrefix })}
        className={TEXT_INPUT_CLASS}
        disabled={disabled}
        value={year}
        onChange={(e) => {
          setYear(e.target.value);
          emit(month, e.target.value);
        }}
      >
        <option value="">{t("expForm.year")}</option>
        {YEARS.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
};

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
  const { t } = useTranslation("talent");
  const form = useForm<WorkExperienceFormValues>({
    resolver: zodResolver(workExperienceFormSchema),
    defaultValues: toDefaultValues(initial),
  });
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form;
  useRevalidateOnLocaleChange(form);

  const [isCurrent, startMonth, endMonth, description] = watch([
    "isCurrent",
    "startMonth",
    "endMonth",
    "description",
  ]);

  const submit = handleSubmit(async (values) => {
    const ok = await onSubmit(values);
    if (ok) onCancel();
  });

  return (
    <InlineForm
      className="animate-fade-up space-y-4 rounded-16 border border-neutral-100 bg-white p-4 sm:p-5"
      onSubmit={() => void submit()}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-10 bg-neutral-100 text-neutral-500">
            <Building2 size={15} />
          </span>
          <div className="min-w-0 flex-1">
            <input
              aria-label={t("expForm.company")}
              autoFocus={!initial}
              className={TEXT_INPUT_CLASS}
              placeholder={t("expForm.company")}
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
              aria-label={t("expForm.title")}
              className={TEXT_INPUT_CLASS}
              placeholder={t("expForm.title")}
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
          aria-label={t("expForm.location")}
          className={TEXT_INPUT_CLASS}
          placeholder={t("expForm.locationPlaceholder")}
          {...register("location")}
        />
      </div>

      <div className="grid gap-4 rounded-12 border border-neutral-100 bg-white p-3.5 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 pt-1.5 text-[11.5px] font-medium text-neutral-600">
            {t("expForm.startDate")}
          </p>
          <MonthYearSelect
            ariaLabelPrefix={t("expForm.startPrefix")}
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
              {t("expForm.endDate")}
            </p>
            <label className="flex items-center gap-1.5 text-[11px] text-neutral-500">
              {t("expForm.currentRole")}
              <Toggle
                on={isCurrent}
                onChange={(v) =>
                  setValue("isCurrent", v, { shouldValidate: true })
                }
              />
            </label>
          </div>
          <MonthYearSelect
            ariaLabelPrefix={t("expForm.endPrefix")}
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
            {t("expForm.whatWork")}{" "}
            <span className="font-normal text-neutral-400">
              {t("expForm.optional")}
            </span>
          </label>
          <span className="text-[11px] text-neutral-400">
            {description?.length ?? 0} / {MAX_DESCRIPTION_LENGTH}
          </span>
        </div>
        <textarea
          className={TEXTAREA_INPUT_CLASS}
          id="we-description"
          placeholder={t("expForm.descPlaceholder")}
          rows={3}
          {...register("description")}
        />
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          className="rounded-10 bg-brand-600 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-brand-700 focus-visible:shadow-focus focus-visible:outline-none disabled:opacity-60"
          disabled={isSubmitting}
          type="button"
          onClick={() => void submit()}
        >
          {isSubmitting
            ? t("expForm.saving")
            : initial
              ? t("expForm.saveChanges")
              : t("expForm.addRole")}
        </button>
        <button
          className="rounded-10 border border-neutral-200 bg-white px-4 py-2 text-[13px] font-medium text-neutral-600 transition-colors hover:border-neutral-300 focus-visible:shadow-focus focus-visible:outline-none"
          type="button"
          onClick={onCancel}
        >
          {t("common.actions.cancel")}
        </button>
      </div>
    </InlineForm>
  );
};
