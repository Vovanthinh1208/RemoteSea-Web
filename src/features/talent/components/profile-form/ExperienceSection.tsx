import { useState } from "react";
import { Briefcase, Plus, SlidersHorizontal, X } from "lucide-react";
import { EMPHASIS_STYLE } from "@/features/talent/components/profile-form/SectionHead";
import { WorkExperienceForm } from "@/features/talent/components/profile-form/WorkExperienceForm";
import { ConfirmAction } from "@/components/shared/ConfirmAction";
import { useToast } from "@/components/ui/toast";
import { reportError } from "@/services/monitoring";
import {
  useCreateWorkExperience,
  useDeleteWorkExperience,
  useUpdateWorkExperience,
  useWorkExperience,
} from "@/features/talent/work-experience.queries";
import {
  monthToIsoDate,
  type WorkExperienceFormValues,
} from "@/features/talent/work-experience.schemas";
import type { WorkExperience } from "@/types/work-experience";

const MAX_EXPERIENCES = 5;

const AVATAR_COLORS = [
  "#1F8A3A",
  "#FF6D3B",
  "#0EA5E9",
  "#8B5CF6",
  "#EC4899",
  "#F59E0B",
];

const colorForCompany = (company: string): string => {
  let hash = 0;
  for (const char of company) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const initialsForCompany = (company: string): string =>
  company
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const formatMonthYear = (iso: string): string =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

type EditorMode =
  { type: "none" } | { type: "create" } | { type: "edit"; id: string };

const RowSkeleton = () => (
  <div className="flex animate-pulse gap-4 py-4 first:pt-0">
    <div className="h-10 w-10 flex-shrink-0 rounded-10 bg-neutral-100" />
    <div className="min-w-0 flex-1 space-y-2 py-0.5">
      <div className="h-3.5 w-2/5 rounded-full bg-neutral-100" />
      <div className="h-3 w-1/4 rounded-full bg-neutral-100" />
    </div>
  </div>
);

const EmptyState = ({ onAdd }: { onAdd: () => void }) => (
  <div className="flex flex-col items-center gap-2 rounded-16 border border-dashed border-neutral-200 py-8 text-center">
    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
      <Briefcase size={16} />
    </span>
    <p className="text-[13px] font-medium text-neutral-700">
      No roles added yet
    </p>
    <p className="max-w-[280px] text-[12px] leading-relaxed text-neutral-400">
      Add your most recent role first — it's the one recruiters read first.
    </p>
    <button
      className="mt-1 flex items-center gap-1.5 rounded-10 bg-brand-600 px-3.5 py-2 text-[12.5px] font-medium text-white transition-colors hover:bg-brand-700"
      type="button"
      onClick={onAdd}
    >
      <Plus size={13} /> Add your first role
    </button>
  </div>
);

export const ExperienceSection = () => {
  const { data: experiences, isLoading } = useWorkExperience();
  const createMutation = useCreateWorkExperience();
  const updateMutation = useUpdateWorkExperience();
  const deleteMutation = useDeleteWorkExperience();
  const { toast } = useToast();
  const [mode, setMode] = useState<EditorMode>({ type: "none" });

  const list = experiences ?? [];
  const atCap = list.length >= MAX_EXPERIENCES;

  const handleCreate = async (
    values: WorkExperienceFormValues
  ): Promise<boolean> => {
    try {
      await createMutation.mutateAsync({
        company: values.company,
        title: values.title,
        location: values.location || undefined,
        startDate: monthToIsoDate(values.startMonth),
        endDate:
          values.isCurrent || !values.endMonth
            ? undefined
            : monthToIsoDate(values.endMonth),
        description: values.description || undefined,
      });
      toast({ variant: "success", title: "Experience added" });
      return true;
    } catch (err) {
      reportError(err);
      toast({
        variant: "error",
        title: "Couldn't add experience",
        description: "Please try again.",
      });
      return false;
    }
  };

  const handleUpdate = async (
    id: string,
    values: WorkExperienceFormValues
  ): Promise<boolean> => {
    try {
      await updateMutation.mutateAsync({
        id,
        payload: {
          company: values.company,
          title: values.title,
          location: values.location || null,
          startDate: monthToIsoDate(values.startMonth),
          endDate:
            values.isCurrent || !values.endMonth
              ? null
              : monthToIsoDate(values.endMonth),
          description: values.description || null,
        },
      });
      toast({ variant: "success", title: "Experience updated" });
      return true;
    } catch (err) {
      reportError(err);
      toast({
        variant: "error",
        title: "Couldn't update experience",
        description: "Please try again.",
      });
      return false;
    }
  };

  const handleDelete = async (experience: WorkExperience) => {
    try {
      await deleteMutation.mutateAsync(experience.id);
      toast({ variant: "success", title: "Experience removed" });
    } catch (err) {
      reportError(err);
      toast({
        variant: "error",
        title: "Couldn't remove experience",
        description: "Please try again.",
      });
    }
  };

  return (
    <section
      className="scroll-mt-6 rounded-20 border border-neutral-100 bg-white p-7"
      id="experience"
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-[1fr_220px]">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              03 · Track record
            </p>
            {!isLoading && list.length > 0 && (
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10.5px] font-medium text-neutral-500">
                {list.length} / {MAX_EXPERIENCES}
              </span>
            )}
          </div>
          <h2 className="text-[22px] font-semibold text-neutral-900">
            <em
              className="font-serif italic text-brand-700"
              style={EMPHASIS_STYLE}
            >
              Experience.
            </em>
          </h2>
        </div>
        <p className="text-[13px] leading-relaxed text-neutral-500">
          List up to 5 roles. Recruiters skim — the most recent two get 80% of
          attention.
        </p>
      </div>

      {isLoading ? (
        <div className="divide-y divide-neutral-50">
          <RowSkeleton />
          <RowSkeleton />
        </div>
      ) : (
        <div className="divide-y divide-neutral-50">
          {list.map((experience) =>
            mode.type === "edit" && mode.id === experience.id ? (
              <div className="py-4 first:pt-0" key={experience.id}>
                <WorkExperienceForm
                  initial={experience}
                  onCancel={() => setMode({ type: "none" })}
                  onSubmit={(values) => handleUpdate(experience.id, values)}
                />
              </div>
            ) : (
              <div
                className="flex animate-fade-up gap-4 py-4 first:pt-0"
                key={experience.id}
              >
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-10 text-[13px] font-bold text-white"
                  style={{
                    background: colorForCompany(experience.company),
                  }}
                >
                  {initialsForCompany(experience.company)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-1.5 text-[13.5px] font-semibold text-neutral-900">
                    {experience.title}{" "}
                    <span className="font-normal text-neutral-500">
                      at {experience.company}
                    </span>
                    {!experience.endDate && (
                      <span className="rounded-full bg-brand-50 px-1.5 py-0.5 text-[10px] font-medium text-brand-700">
                        Current
                      </span>
                    )}
                  </p>
                  <p className="mb-1.5 flex items-center gap-1.5 text-[12px] text-neutral-400">
                    {experience.location && (
                      <>
                        <span>{experience.location}</span>
                        <span className="h-0.5 w-0.5 rounded-full bg-neutral-300" />
                      </>
                    )}
                    <span className="font-mono">
                      {formatMonthYear(experience.startDate)} →{" "}
                      {experience.endDate
                        ? formatMonthYear(experience.endDate)
                        : "Present"}
                    </span>
                  </p>
                  {experience.description && (
                    <p className="text-[12.5px] leading-relaxed text-neutral-600">
                      {experience.description}
                    </p>
                  )}
                </div>
                <div className="flex flex-shrink-0 gap-1">
                  <button
                    aria-label="Edit role"
                    className="flex h-7 w-7 items-center justify-center rounded-8 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                    type="button"
                    onClick={() => setMode({ type: "edit", id: experience.id })}
                  >
                    <SlidersHorizontal size={12} />
                  </button>
                  <ConfirmAction
                    isPending={deleteMutation.isPending}
                    message="Delete?"
                    onConfirm={() => handleDelete(experience)}
                  >
                    {({ onClick }) => (
                      <button
                        aria-label="Delete role"
                        className="flex h-7 w-7 items-center justify-center rounded-8 text-neutral-400 hover:bg-red-50 hover:text-red-600"
                        type="button"
                        onClick={onClick}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </ConfirmAction>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {mode.type === "create" && (
        <div className="mt-2">
          <WorkExperienceForm
            onCancel={() => setMode({ type: "none" })}
            onSubmit={handleCreate}
          />
        </div>
      )}

      {!isLoading && mode.type !== "create" && list.length === 0 && (
        <EmptyState onAdd={() => setMode({ type: "create" })} />
      )}

      {!isLoading && mode.type !== "create" && list.length > 0 && !atCap && (
        <button
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-12 border border-dashed border-neutral-300 py-3 text-[13px] text-neutral-500 transition-colors hover:border-brand-300 hover:text-brand-700"
          type="button"
          onClick={() => setMode({ type: "create" })}
        >
          <Plus size={13} /> Add another role
        </button>
      )}

      {!isLoading && atCap && mode.type !== "create" && (
        <p className="mt-2 text-center text-[12px] text-neutral-400">
          You've reached the 5-role limit — remove one to add another.
        </p>
      )}
    </section>
  );
};
