import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { Toggle } from "@/features/talent/components/profile-form/Toggle";
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

interface HighlightFormProps {
  type: ProfileHighlightType;
  initial?: ProfileHighlight;
  onSubmit: (values: HighlightFormValues) => Promise<boolean>;
  onCancel: () => void;
}

const FIELD_LABELS: Record<
  ProfileHighlightType,
  { title: string; subtitle: string }
> = {
  PORTFOLIO: { title: "Project title", subtitle: "Role · duration" },
  EDUCATION: { title: "School", subtitle: "Degree · field of study" },
  LANGUAGE: {
    title: "Language",
    subtitle: "Proficiency (e.g. Native, Fluent, Conversational)",
  },
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

const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <p className="mt-1 flex items-center gap-1 text-[11.5px] text-red-600">
      <AlertCircle size={11} /> {message}
    </p>
  ) : null;

export const HighlightForm = ({
  type,
  initial,
  onSubmit,
  onCancel,
}: HighlightFormProps) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<HighlightFormValues>({
    resolver: zodResolver(highlightFormSchema),
    defaultValues: toDefaultValues(initial),
  });

  const isOngoing = watch("isOngoing");
  const labels = FIELD_LABELS[type];

  return (
    <form
      className="animate-fade-up space-y-3 rounded-16 border border-brand-100 bg-brand-50/30 p-4"
      onSubmit={handleSubmit(async (values) => {
        const ok = await onSubmit(values);
        if (ok) onCancel();
      })}
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
            aria-label="Description"
            className={TEXTAREA_INPUT_CLASS}
            placeholder="What was this project? (optional)"
            rows={2}
            {...register("description")}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              aria-label="Category tag"
              className={TEXT_INPUT_CLASS}
              placeholder="Category (optional) — e.g. Product · Production"
              {...register("tag")}
            />
            <div>
              <input
                aria-label="Project link"
                className={TEXT_INPUT_CLASS}
                placeholder="Link (optional) — https://…"
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
              Start year
            </p>
            <select
              aria-label="Start year"
              className={SELECT_INPUT_CLASS}
              {...register("startYear")}
            >
              <option value="">Year</option>
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
                End year
              </p>
              <label className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                Ongoing
                <Toggle
                  on={isOngoing}
                  onChange={(v) => setValue("isOngoing", v)}
                />
              </label>
            </div>
            <select
              aria-label="End year"
              className={SELECT_INPUT_CLASS}
              disabled={isOngoing}
              {...register("endYear")}
            >
              <option value="">Year</option>
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
          className="rounded-10 bg-brand-600 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Saving…" : initial ? "Save changes" : "Add"}
        </button>
        <button
          className="rounded-10 border border-neutral-200 bg-white px-4 py-2 text-[13px] font-medium text-neutral-600 transition-colors hover:border-neutral-300"
          type="button"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
