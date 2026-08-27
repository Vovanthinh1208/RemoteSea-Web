import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PillToggle } from "@/components/shared/PillToggle";
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
import type { CreateAlertPayload } from "@/types/alert";

interface CreateAlertFormProps {
  onCreate: (payload: CreateAlertPayload) => Promise<boolean>;
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

export const CreateAlertForm = ({ onCreate }: CreateAlertFormProps) => {
  const { data: categories } = useCategories();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateAlertFormValues>({
    resolver: zodResolver(createAlertFormSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const categoryIds = watch("categoryIds");

  const toggleCategory = (categoryId: string) => {
    setValue(
      "categoryIds",
      categoryIds.includes(categoryId)
        ? categoryIds.filter((id) => id !== categoryId)
        : [...categoryIds, categoryId]
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
      categoryIds: values.categoryIds.length ? values.categoryIds : undefined,
    });
    // Only clear the form if the alert was actually created — on failure the
    // user keeps their input to retry (the error toast already fired).
    if (created) reset();
  };

  return (
    <form
      className="mb-8 space-y-4 rounded-16 border border-neutral-100 bg-white p-5 shadow-card"
      onSubmit={handleSubmit(onSubmit)}
    >
      <h2 className="text-[14px] font-semibold text-neutral-900">
        Create a new alert
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label
            className="block text-[12.5px] font-medium text-neutral-700"
            htmlFor="alert-name"
          >
            Alert name
          </label>
          <input
            className={TEXT_INPUT_CLASS}
            id="alert-name"
            placeholder="e.g. Senior remote engineering"
            {...register("name")}
          />
          {errors.name && (
            <p className="mt-1 text-[12px] text-red-600">
              {errors.name.message}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <label
            className="block text-[12.5px] font-medium text-neutral-700"
            htmlFor="alert-keywords"
          >
            Keywords{" "}
            <span className="font-normal text-neutral-400">(optional)</span>
          </label>
          <input
            className={TEXT_INPUT_CLASS}
            id="alert-keywords"
            placeholder="e.g. React, remote"
            {...register("keywords")}
          />
        </div>
        <div className="space-y-1.5">
          <label
            className="block text-[12.5px] font-medium text-neutral-700"
            htmlFor="alert-job-type"
          >
            Job type
          </label>
          <select
            className={SELECT_INPUT_CLASS}
            id="alert-job-type"
            {...register("jobType")}
          >
            <option value="">Any job type</option>
            {JOB_TYPES.map((jobType) => (
              <option key={jobType} value={jobType}>
                {jobType.replace("_", " ").toLowerCase()}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label
            className="block text-[12.5px] font-medium text-neutral-700"
            htmlFor="alert-level"
          >
            Seniority level
          </label>
          <select
            className={SELECT_INPUT_CLASS}
            id="alert-level"
            {...register("level")}
          >
            <option value="">Any level</option>
            {LEVELS.map((level) => (
              <option key={level} value={level}>
                {level.toLowerCase()}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label
            className="block text-[12.5px] font-medium text-neutral-700"
            htmlFor="alert-salary-min"
          >
            Minimum salary{" "}
            <span className="font-normal text-neutral-400">
              (USD/mo, optional)
            </span>
          </label>
          <input
            className={TEXT_INPUT_CLASS}
            id="alert-salary-min"
            min={0}
            placeholder="e.g. 2000"
            type="number"
            {...register("salaryMin")}
          />
        </div>
        <div className="space-y-1.5">
          <label
            className="block text-[12.5px] font-medium text-neutral-700"
            htmlFor="alert-frequency"
          >
            Notification frequency
          </label>
          <select
            className={SELECT_INPUT_CLASS}
            id="alert-frequency"
            {...register("frequency")}
          >
            {FREQUENCIES.map((frequency) => (
              <option key={frequency} value={frequency}>
                {frequency.toLowerCase()}
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
                {category.name}
              </PillToggle>
            );
          })}
        </div>
      )}

      <Button disabled={isSubmitting} type="submit">
        <Plus size={14} /> {isSubmitting ? "Creating…" : "Create alert"}
      </Button>
    </form>
  );
};
