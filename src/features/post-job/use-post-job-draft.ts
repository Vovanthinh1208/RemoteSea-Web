import { useEffect } from "react";
import { useToast } from "@/components/ui/toast";
import { INITIAL_FORM_STATE, type PostJobFormState } from "@/features/post-job/post-job.schemas";

const DRAFT_STORAGE_KEY = "remotesea:post-job-draft";
const AUTOSAVE_DEBOUNCE_MS = 400;

// The pristine-form comparison target never changes — serialized once at module
// load instead of on every keystroke render.
const PRISTINE_FORM_JSON = JSON.stringify({ ...INITIAL_FORM_STATE, jobCategoryId: "" });

export type StoredDraft = { form: PostJobFormState; step: number };

/**
 * Reads the saved draft (synchronously, so the caller can seed its initial
 * state from it — no restore flash). Merging over INITIAL_FORM_STATE keeps an
 * old draft usable after the form gains new fields; a corrupt/blocked read just
 * starts fresh.
 */
export const loadPostJobDraft = (): StoredDraft | null => {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredDraft>;
    if (!parsed.form) return null;
    return {
      form: { ...INITIAL_FORM_STATE, ...parsed.form },
      step: typeof parsed.step === "number" ? parsed.step : 1,
    };
  } catch {
    return null;
  }
};

/**
 * Owns the post-job wizard's localStorage draft lifecycle: toasts once if a
 * draft was restored, autosaves the live form on a debounce, and clears it on
 * publish. Autosave replaces an earlier beforeunload warning — with the draft
 * written on every change, closing the tab loses nothing, so warning would be
 * pure friction.
 */
export const usePostJobDraftPersistence = (
  form: PostJobFormState,
  step: number,
  published: boolean,
  restoredFromDraft: boolean
): void => {
  const { toast } = useToast();

  useEffect(() => {
    if (restoredFromDraft) {
      toast({
        title: "Draft restored",
        description: "Picked up where you left off. Publishing clears the draft.",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // jobCategoryId alone doesn't count as user input (the wizard auto-defaults it
  // when categories load); skip writing until something real differs, so a
  // pristine visit never plants a draft.
  const hasUserInput =
    step > 1 || JSON.stringify({ ...form, jobCategoryId: "" }) !== PRISTINE_FORM_JSON;

  useEffect(() => {
    if (published) {
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {
        // Storage unavailable — nothing persisted to clear.
      }
      return;
    }
    if (!hasUserInput) return;
    // Debounced so typing stays free of the JSON.stringify + blocking
    // localStorage write it used to pay per keystroke; a hard tab-close can
    // lose at most this last window.
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ form, step }));
      } catch {
        // Storage full/blocked — the wizard still works, just without autosave.
      }
    }, AUTOSAVE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [form, step, published, hasUserInput]);
};
