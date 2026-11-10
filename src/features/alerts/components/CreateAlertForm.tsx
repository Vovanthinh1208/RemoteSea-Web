import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PillToggle } from "@/components/shared/PillToggle";
import { FieldError } from "@/components/shared/FieldError";
import {
  SELECT_INPUT_CLASS,
  TEXT_INPUT_CLASS,
} from "@/components/shared/input-styles";
import { useCategories } from "@/features/taxonomy/taxonomy.queries";
import {
  createAlertFormSchema,
  FREQUENCIES,
  JOB_TYPES,
  LEVELS,
  type CreateAlertFormValues,
} from "@/features/alerts/alerts.schemas";
import type { CreateAlertPayload, JobAlert } from "@/types/alert";
import { useTranslation } from "@/i18n/useTranslation";
import { useRevalidateOnLocaleChange } from "@/i18n/useRevalidateOnLocaleChange";
import { filterValueLabel } from "@/features/jobs/jobs.utils";
import { JOB_TYPE_LABELS, LEVEL_LABELS } from "@/utils/labels";

interface CreateAlertFormProps {
  onCreate: (payload: CreateAlertPayload) => Promise<boolean>;
  isLimitReached?: boolean;
  initialAlert?: JobAlert;
}

const DEFAULT_FORM_VALUES: CreateAlertFormValues = {
  name: "",
  keywords: "",
  jobType: "",
  level: "",
  salaryMin: "",
  frequency: "DAILY",
  categoryIds: [],
};

export const CreateAlertForm = ({
  onCreate,
  isLimitReached,
  initialAlert,
}: CreateAlertFormProps) => {
  const { t } = useTranslation("alerts");
  const { data: categories } = useCategories();

  const form = useForm<CreateAlertFormValues>({
    resolver: zodResolver(createAlertFormSchema),
    defaultValues: initialAlert
      ? {
          name: initialAlert.name,
          keywords: initialAlert.keywords ?? "",
          jobType: initialAlert.jobType ?? "",
          level: initialAlert.level ?? "",
          salaryMin:
            initialAlert.salaryMin === null
              ? ""
              : String(initialAlert.salaryMin),
          country: initialAlert.country ?? "",
          frequency: initialAlert.frequency,
          categoryIds: initialAlert.categories.map((c) => c.category.id),
        }
      : DEFAULT_FORM_VALUES,
  });
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = form;
  useRevalidateOnLocaleChange(form);

  const categoryIds = watch("categoryIds");

  const toggleCategory = (categoryId: string) => {
    setValue(
      "categoryIds",
      categoryIds.includes(categoryId)
        ? categoryIds.filter((id) => id !== categoryId)
        : categoryIds.length < 3
          ? [...categoryIds, categoryId]
          : categoryIds
    );
  };

  const onSubmit = async (values: CreateAlertFormValues) => {
    const created = await onCreate({
      name: values.name,
      keywords: values.keywords || undefined,
      jobType: values.jobType || undefined,
      level: values.level || undefined,
      salaryMin: values.salaryMin ? Number(values.salaryMin) : undefined,
      frequency: values.frequency,
      country: values.country?.trim() || undefined,
      categoryIds: values.categoryIds.length ? values.categoryIds : undefined,
    });
    // Only clear the form if the alert was actually created — on failure the
    // user keeps their input to retry (the error toast already fired).
    if (created && !initialAlert) reset();
  };

  return (
    <form
      className="mb-8 space-y-4 rounded-16 border border-neutral-100 bg-white p-5 shadow-card"
      onSubmit={handleSubmit(onSubmit)}
    >
      <h2 className="text-[14px] font-semibold text-neutral-900">
        {initialAlert ? t("item.edit") : t("form.title")}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label
            className="block text-[12.5px] font-medium text-neutral-700"
            htmlFor={`alert-country-${initialAlert?.id ?? "new"}`}
          >
            {t("form.country")}
          </label>
          <input
            id={`alert-country-${initialAlert?.id ?? "new"}`}
            className={TEXT_INPUT_CLASS}
            {...register("country")}
          />
        </div>
        <div className="space-y-1.5">
          <label
            className="block text-[12.5px] font-medium text-neutral-700"
            htmlFor={
              initialAlert ? `alert-name-${initialAlert.id}` : "alert-name"
            }
          >
            {t("form.name")}
          </label>
          <input
            className={TEXT_INPUT_CLASS}
            id={initialAlert ? `alert-name-${initialAlert.id}` : "alert-name"}
            placeholder={t("form.namePlaceholder")}
            {...register("name")}
          />
          <FieldError message={errors.name?.message} />
        </div>
        <div className="space-y-1.5">
          <label
            className="block text-[12.5px] font-medium text-neutral-700"
            htmlFor={
              initialAlert
                ? `alert-keywords-${initialAlert.id}`
                : "alert-keywords"
            }
          >
            {t("form.keywords")}{" "}
            <span className="font-normal text-neutral-400">
              {t("form.optional")}
            </span>
          </label>
          <input
            className={TEXT_INPUT_CLASS}
            id={
              initialAlert
                ? `alert-keywords-${initialAlert.id}`
                : "alert-keywords"
            }
            placeholder={t("form.keywordsPlaceholder")}
            {...register("keywords")}
          />
        </div>
        <div className="space-y-1.5">
          <label
            className="block text-[12.5px] font-medium text-neutral-700"
            htmlFor={
              initialAlert
                ? `alert-job-type-${initialAlert.id}`
                : "alert-job-type"
            }
          >
            {t("form.jobType")}
          </label>
          <select
            className={SELECT_INPUT_CLASS}
            id={
              initialAlert
                ? `alert-job-type-${initialAlert.id}`
                : "alert-job-type"
            }
            {...register("jobType")}
          >
            <option value="">{t("form.anyJobType")}</option>
            {JOB_TYPES.map((jobType) => (
              <option key={jobType} value={jobType}>
                {JOB_TYPE_LABELS[jobType]}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label
            className="block text-[12.5px] font-medium text-neutral-700"
            htmlFor={
              initialAlert ? `alert-level-${initialAlert.id}` : "alert-level"
            }
          >
            {t("form.level")}
          </label>
          <select
            className={SELECT_INPUT_CLASS}
            id={initialAlert ? `alert-level-${initialAlert.id}` : "alert-level"}
            {...register("level")}
          >
            <option value="">{t("form.anyLevel")}</option>
            {LEVELS.map((level) => (
              <option key={level} value={level}>
                {LEVEL_LABELS[level]}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label
            className="block text-[12.5px] font-medium text-neutral-700"
            htmlFor={
              initialAlert
                ? `alert-salary-min-${initialAlert.id}`
                : "alert-salary-min"
            }
          >
            {t("form.salary")}{" "}
            <span className="font-normal text-neutral-400">
              {t("form.salaryUnit")}
            </span>
          </label>
          <input
            className={TEXT_INPUT_CLASS}
            id={
              initialAlert
                ? `alert-salary-min-${initialAlert.id}`
                : "alert-salary-min"
            }
            min={0}
            placeholder={t("form.salaryPlaceholder")}
            type="number"
            {...register("salaryMin")}
          />
          <FieldError message={errors.salaryMin?.message} />
        </div>
        <div className="space-y-1.5">
          <label
            className="block text-[12.5px] font-medium text-neutral-700"
            htmlFor={
              initialAlert
                ? `alert-frequency-${initialAlert.id}`
                : "alert-frequency"
            }
          >
            {t("form.frequency")}
          </label>
          <select
            className={SELECT_INPUT_CLASS}
            id={
              initialAlert
                ? `alert-frequency-${initialAlert.id}`
                : "alert-frequency"
            }
            {...register("frequency")}
          >
            {FREQUENCIES.map((frequency) => (
              <option key={frequency} value={frequency}>
                {t(`freq.${frequency}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {categories && categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {categories.map((category) => {
            const isSelected = categoryIds.includes(category.id);
            return (
              <PillToggle
                active={isSelected}
                activeClassName="border-brand-600 bg-brand-50 text-brand-700"
                className="border px-3 py-1 text-[12px] transition-colors"
                inactiveClassName="border-neutral-200 text-neutral-600 hover:border-neutral-300"
                key={category.id}
                onClick={() => toggleCategory(category.id)}
              >
                {filterValueLabel(category.name)}
              </PillToggle>
            );
          })}
        </div>
      )}

      {isLimitReached && (
        <div className="rounded-8 border border-amber-200 bg-amber-50 p-3 text-[13px] text-amber-800">
          {t("form.limitReached", {
            defaultValue:
              "You have reached the maximum limit of 5 job alerts. Please delete an alert before creating a new one.",
          })}
        </div>
      )}

      <Button disabled={isSubmitting || isLimitReached} type="submit">
        <Plus size={14} />{" "}
        {isSubmitting
          ? t("common.actions.saving")
          : initialAlert
            ? t("common.actions.save")
            : t("form.create")}
      </Button>
    </form>
  );
};
