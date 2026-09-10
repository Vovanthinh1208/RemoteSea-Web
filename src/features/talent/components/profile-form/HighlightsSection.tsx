import { useState } from "react";
import {
  Briefcase,
  Globe2,
  GraduationCap,
  Plus,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  SectionHead,
  EMPHASIS_STYLE,
} from "@/features/talent/components/profile-form/SectionHead";
import { HighlightForm } from "@/features/talent/components/profile-form/HighlightForm";
import { ConfirmAction } from "@/components/shared/ConfirmAction";
import { useToast } from "@/components/ui/toast";
import { reportError } from "@/services/monitoring";
import {
  useCreateProfileHighlight,
  useDeleteProfileHighlight,
  useProfileHighlights,
  useUpdateProfileHighlight,
} from "@/features/talent/profile-highlight.queries";
import type { HighlightFormValues } from "@/features/talent/profile-highlight.schemas";
import type {
  ProfileHighlight,
  ProfileHighlightType,
} from "@/types/profile-highlight";

const MAX_PER_TYPE = 5;

const TYPE_META: Record<
  ProfileHighlightType,
  {
    title: string;
    help: string;
    icon: typeof Briefcase;
    addLabel: string;
    emptyLabel: string;
  }
> = {
  PORTFOLIO: {
    title: "Selected work",
    help: "A couple of projects you're proud of — recruiters click through these.",
    icon: Briefcase,
    addLabel: "Add project",
    emptyLabel: "No projects added yet",
  },
  EDUCATION: {
    title: "Education",
    help: "Degrees or programs. Most recent first isn't enforced — add in any order.",
    icon: GraduationCap,
    addLabel: "Add education",
    emptyLabel: "No education added yet",
  },
  LANGUAGE: {
    title: "Languages",
    help: "Languages you can work in, and how comfortably.",
    icon: Globe2,
    addLabel: "Add language",
    emptyLabel: "No languages added yet",
  },
};

type EditorMode =
  { type: "none" } | { type: "create" } | { type: "edit"; id: string };

const toCreatePayload = (
  type: ProfileHighlightType,
  values: HighlightFormValues
) => {
  const base = {
    title: values.title,
    subtitle: values.subtitle || undefined,
  };
  if (type === "PORTFOLIO") {
    return {
      type: "PORTFOLIO" as const,
      ...base,
      description: values.description || undefined,
      tag: values.tag || undefined,
      url: values.url || undefined,
    };
  }
  if (type === "EDUCATION") {
    return {
      type: "EDUCATION" as const,
      ...base,
      startYear: Number(values.startYear),
      endYear:
        values.isOngoing || !values.endYear
          ? undefined
          : Number(values.endYear),
    };
  }
  return { type: "LANGUAGE" as const, ...base };
};

const toUpdatePayload = (
  type: ProfileHighlightType,
  values: HighlightFormValues
) => {
  const base = {
    title: values.title,
    subtitle: values.subtitle || null,
  };
  if (type === "PORTFOLIO") {
    return {
      ...base,
      description: values.description || null,
      tag: values.tag || null,
      url: values.url || null,
    };
  }
  if (type === "EDUCATION") {
    return {
      ...base,
      startYear: values.startYear ? Number(values.startYear) : undefined,
      endYear:
        values.isOngoing || !values.endYear ? null : Number(values.endYear),
    };
  }
  return base;
};

const HighlightTypeList = ({ type }: { type: ProfileHighlightType }) => {
  const { data: highlights } = useProfileHighlights();
  const createMutation = useCreateProfileHighlight();
  const updateMutation = useUpdateProfileHighlight();
  const deleteMutation = useDeleteProfileHighlight();
  const { toast } = useToast();
  const [mode, setMode] = useState<EditorMode>({ type: "none" });

  const meta = TYPE_META[type];
  const list = (highlights ?? []).filter((h) => h.type === type);
  const atCap = list.length >= MAX_PER_TYPE;

  const handleCreate = async (
    values: HighlightFormValues
  ): Promise<boolean> => {
    try {
      await createMutation.mutateAsync(toCreatePayload(type, values));
      toast({
        variant: "success",
        title: `${meta.title.replace(/s$/, "")} added`,
      });
      return true;
    } catch (err) {
      reportError(err);
      toast({
        variant: "error",
        title: `Couldn't add entry`,
        description: "Please try again.",
      });
      return false;
    }
  };

  const handleUpdate = async (
    id: string,
    values: HighlightFormValues
  ): Promise<boolean> => {
    try {
      await updateMutation.mutateAsync({
        id,
        payload: toUpdatePayload(type, values),
      });
      toast({ variant: "success", title: "Entry updated" });
      return true;
    } catch (err) {
      reportError(err);
      toast({
        variant: "error",
        title: "Couldn't update entry",
        description: "Please try again.",
      });
      return false;
    }
  };

  const handleDelete = async (highlight: ProfileHighlight) => {
    try {
      await deleteMutation.mutateAsync(highlight.id);
      toast({ variant: "success", title: "Entry removed" });
    } catch (err) {
      reportError(err);
      toast({
        variant: "error",
        title: "Couldn't remove entry",
        description: "Please try again.",
      });
    }
  };

  return (
    <div className="border-t border-neutral-50 pt-5 first:border-none first:pt-0">
      <div className="mb-3 flex items-center gap-2">
        <meta.icon className="text-neutral-400" size={14} />
        <h3 className="text-[13.5px] font-semibold text-neutral-900">
          {meta.title}
        </h3>
        {list.length > 0 && (
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10.5px] font-medium text-neutral-500">
            {list.length} / {MAX_PER_TYPE}
          </span>
        )}
      </div>
      <p className="mb-3 text-[12px] text-neutral-400">{meta.help}</p>

      {list.length > 0 && (
        <div className="mb-2 divide-y divide-neutral-50">
          {list.map((highlight) =>
            mode.type === "edit" && mode.id === highlight.id ? (
              <div className="py-3 first:pt-0" key={highlight.id}>
                <HighlightForm
                  initial={highlight}
                  onCancel={() => setMode({ type: "none" })}
                  onSubmit={(values) => handleUpdate(highlight.id, values)}
                  type={type}
                />
              </div>
            ) : (
              <div
                className="flex items-start justify-between gap-3 py-3 first:pt-0"
                key={highlight.id}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-neutral-900">
                    {highlight.title}
                    {type === "EDUCATION" && (
                      <span className="ml-1.5 font-normal text-neutral-400">
                        · {highlight.startYear} –{" "}
                        {highlight.endYear ?? "Present"}
                      </span>
                    )}
                  </p>
                  {highlight.subtitle && (
                    <p className="text-[12px] text-neutral-500">
                      {highlight.subtitle}
                    </p>
                  )}
                  {highlight.description && (
                    <p className="mt-0.5 text-[12px] leading-relaxed text-neutral-500">
                      {highlight.description}
                    </p>
                  )}
                </div>
                <div className="flex flex-shrink-0 gap-1">
                  <button
                    aria-label="Edit"
                    className="flex h-7 w-7 items-center justify-center rounded-8 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 focus-visible:shadow-focus focus-visible:outline-none"
                    type="button"
                    onClick={() => setMode({ type: "edit", id: highlight.id })}
                  >
                    <SlidersHorizontal size={12} />
                  </button>
                  <ConfirmAction
                    isPending={deleteMutation.isPending}
                    message="Delete?"
                    onConfirm={() => handleDelete(highlight)}
                  >
                    {({ onClick }) => (
                      <button
                        aria-label="Delete"
                        className="flex h-7 w-7 items-center justify-center rounded-8 text-neutral-400 hover:bg-red-50 hover:text-red-600 focus-visible:shadow-focus focus-visible:outline-none"
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

      {mode.type === "create" ? (
        <HighlightForm
          onCancel={() => setMode({ type: "none" })}
          onSubmit={handleCreate}
          type={type}
        />
      ) : (
        <>
          {list.length === 0 && (
            <p className="mb-2 text-[12px] text-neutral-400">
              {meta.emptyLabel}
            </p>
          )}
          {!atCap && (
            <button
              className="flex w-full items-center justify-center gap-2 rounded-12 border border-dashed border-neutral-300 py-2.5 text-[12.5px] text-neutral-500 transition-colors hover:border-brand-300 hover:text-brand-700 focus-visible:shadow-focus focus-visible:outline-none"
              type="button"
              onClick={() => setMode({ type: "create" })}
            >
              <Plus size={12} /> {meta.addLabel}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export const HighlightsSection = () => (
  <section
    className="scroll-mt-6 rounded-20 border border-neutral-100 bg-white p-7"
    id="highlights"
  >
    <SectionHead
      eyebrow="08 · Show, don't tell"
      help="Optional, but recruiters skim these before reading your bio. Shown on your public profile."
      title={
        <em className="font-serif italic text-brand-700" style={EMPHASIS_STYLE}>
          Highlights.
        </em>
      }
    />
    <div className="space-y-5">
      <HighlightTypeList type="PORTFOLIO" />
      <HighlightTypeList type="EDUCATION" />
      <HighlightTypeList type="LANGUAGE" />
    </div>
  </section>
);
