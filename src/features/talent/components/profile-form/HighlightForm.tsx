import { InlineForm } from "@/features/talent/components/profile-form/InlineForm";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Toggle } from "@/features/talent/components/profile-form/Toggle";
import { FieldError } from "@/components/shared/FieldError";
import {
  SELECT_INPUT_CLASS,
  TEXT_INPUT_CLASS,
  TEXTAREA_INPUT_CLASS,
} from "@/components/shared/input-styles";
import {
  HIGHLIGHT_YEARS,
  highlightFormSchema,
  type HighlightFormValues,
} from "@/features/talent/profile-highlight.schemas";
import type {
  ProfileHighlight,
  ProfileHighlightType,
} from "@/types/profile-highlight";
import { useTranslation } from "@/i18n/useTranslation";
import { useRevalidateOnLocaleChange } from "@/i18n/useRevalidateOnLocaleChange";

interface HighlightFormProps {
  type: ProfileHighlightType;
  initial?: ProfileHighlight;
  onSubmit: (values: HighlightFormValues) => Promise<boolean>;
  onCancel: () => void;
}

const FIELD_SLUGS: Record<
  ProfileHighlightType,
  "portfolio" | "education" | "language"
> = {
  PORTFOLIO: "portfolio",
  EDUCATION: "education",
  LANGUAGE: "language",
};

const toDefaultValues = (initial?: ProfileHighlight): HighlightFormValues => ({
  title: initial?.title ?? "",
  subtitle: initial?.subtitle ?? "",
  description: initial?.description ?? "",
  tag: initial?.tag ?? "",
  url: initial?.url ?? "",
  startYear: initial?.startYear ? String(initial.startYear) : "",
  isOngoing: initial ? initial.endYear === null : true,
  endYear: initial?.endYear ? String(initial.endYear) : "",
});

export const HighlightForm = ({
  type,
  initial,
  onSubmit,
  onCancel,
}: HighlightFormProps) => {
  const { t } = useTranslation("talent");
  const form = useForm<HighlightFormValues>({
    resolver: zodResolver(highlightFormSchema),
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

  const isOngoing = watch("isOngoing");
  const labels = {
    title: t(`hlForm.${FIELD_SLUGS[type]}.title`),
    subtitle: t(`hlForm.${FIELD_SLUGS[type]}.subtitle`),
  };

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
        <div>
          <input
            aria-label={labels.title}
            autoFocus={!initial}
            className={TEXT_INPUT_CLASS}
            placeholder={labels.title}
            {...register("title")}
          />
          <FieldError message={errors.title?.message} />
        </div>
        <input
          aria-label={labels.subtitle}
          className={TEXT_INPUT_CLASS}
          placeholder={labels.subtitle}
          {...register("subtitle")}
        />
      </div>

      {type === "PORTFOLIO" && (
        <>
          <textarea
            aria-label={t("hlForm.description")}
            className={TEXTAREA_INPUT_CLASS}
            placeholder={t("hlForm.descPlaceholder")}
            rows={2}
            {...register("description")}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              aria-label={t("hlForm.tag")}
              className={TEXT_INPUT_CLASS}
              placeholder={t("hlForm.tagPlaceholder")}
              {...register("tag")}
            />
            <div>
              <input
                aria-label={t("hlForm.link")}
                className={TEXT_INPUT_CLASS}
                placeholder={t("hlForm.linkPlaceholder")}
                {...register("url")}
              />
              <FieldError message={errors.url?.message} />
            </div>
          </div>
        </>
      )}

      {type === "EDUCATION" && (
        <div className="grid gap-3 rounded-12 border border-neutral-100 bg-white p-3.5 sm:grid-cols-2">
          <div>
            <p className="mb-1.5 text-[11.5px] font-medium text-neutral-600">
              {t("hlForm.startYear")}
            </p>
            <select
              aria-label={t("hlForm.startYear")}
              className={SELECT_INPUT_CLASS}
              {...register("startYear")}
            >
              <option value="">{t("hlForm.year")}</option>
              {HIGHLIGHT_YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <FieldError message={errors.startYear?.message} />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <p className="text-[11.5px] font-medium text-neutral-600">
                {t("hlForm.endYear")}
              </p>
              <label className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                {t("hlForm.ongoing")}
                <Toggle
                  on={isOngoing}
                  onChange={(v) => setValue("isOngoing", v)}
                />
              </label>
            </div>
            <select
              aria-label={t("hlForm.endYear")}
              className={SELECT_INPUT_CLASS}
              disabled={isOngoing}
              {...register("endYear")}
            >
              <option value="">{t("hlForm.year")}</option>
              {HIGHLIGHT_YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <FieldError message={errors.endYear?.message} />
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 pt-1">
        <button
          className="rounded-10 bg-brand-600 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-brand-700 focus-visible:shadow-focus focus-visible:outline-none disabled:opacity-60"
          disabled={isSubmitting}
          type="button"
          onClick={() => void submit()}
        >
          {isSubmitting
            ? t("hlForm.saving")
            : initial
              ? t("hlForm.saveChanges")
              : t("hlForm.add")}
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
