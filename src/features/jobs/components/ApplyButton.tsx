import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, ArrowRight, Check } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  useApplyToJob,
  useMyApplicationIds,
} from "@/features/applications/applications.queries";
import { useMyTalentProfile } from "@/features/talent/talent.queries";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { TEXTAREA_INPUT_CLASS } from "@/components/shared/input-styles";
import { ApiError } from "@/core/errors/api-error";
import { useSubmitError } from "@/hooks/useSubmitError";
import { ROUTES } from "@/constants/routes";
import { useTranslation } from "@/i18n/useTranslation";

const ALREADY_APPLIED_STATUS = 409;
const PROFILE_REQUIRED_STATUS = 403;
const COVER_LETTER_MAX_LENGTH = 5000;

type ApplyState = "idle" | "open" | "applied" | "error";

interface ApplyButtonProps {
  jobId: string;
}

export const ApplyButton = ({ jobId }: ApplyButtonProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation("jobs");
  const applyToJobMutation = useApplyToJob();
  const { data: appliedJobIds } = useMyApplicationIds();
  const { data: profile } = useMyTalentProfile();
  const [state, setState] = useState<ApplyState>("idle");
  const submitError = useSubmitError();
  const [resumeOverride, setResumeOverride] = useState<string | null>(null);
  const [coverLetter, setCoverLetter] = useState("");

  // Server-derived: previously "applied" was only a local flag, so leaving the
  // page and coming back reset the button to "Apply now" until a click bounced
  // off the 409. The ids query is the source of truth; local state remains the
  // immediate post-click fast path before the invalidated query refetches.
  const applied =
    state === "applied" || (appliedJobIds?.includes(jobId) ?? false);

  // Defaults to whatever's already on the talent's profile — editable per
  // application via the FileUpload below, not a one-time sync, since the
  // profile query can still resolve after this component has mounted.
  const resumeUrl = resumeOverride ?? profile?.resumeUrl ?? undefined;

  const openApplyForm = () => {
    if (!user) {
      navigate(
        `${ROUTES.login}?callbackUrl=${encodeURIComponent(ROUTES.jobDetail(jobId))}`
      );
      return;
    }
    submitError.clear();
    setState("open");
  };

  const handleSubmit = async () => {
    try {
      await applyToJobMutation.mutateAsync({
        jobId,
        resumeUrl,
        coverLetter: coverLetter.trim() || undefined,
      });
      setState("applied");
      toast({
        variant: "success",
        title: t("apply.sentTitle"),
        description: t("apply.sentDesc"),
      });
    } catch (err) {
      if (
        err instanceof ApiError &&
        err.status === ALREADY_APPLIED_STATUS &&
        err.code === "ALREADY_APPLIED"
      ) {
        setState("applied");
        toast({ variant: "info", title: t("apply.alreadyApplied") });
        return;
      }
      if (err instanceof ApiError && err.status === PROFILE_REQUIRED_STATUS) {
        submitError.failWithKey("jobs.apply.profileRequired");
        setState("error");
        toast({
          variant: "info",
          title: t("apply.finishProfile"),
        });
        navigate(ROUTES.profile);
        return;
      }
      setState("error");
      submitError.fail(err);
      toast({
        variant: "error",
        title: t("apply.failedTitle"),
        description: t("apply.tryAgain"),
      });
    }
  };

  if (applied) {
    return (
      <div className="mb-2.5 flex w-full items-center justify-center gap-2 rounded-12 border border-brand-200 bg-brand-50 py-3 text-[15px] font-medium text-brand-700">
        <Check size={16} /> {t("apply.sentTitle")}
      </div>
    );
  }

  if (state !== "open") {
    return (
      <>
        <button
          className="mb-2.5 flex w-full items-center justify-center gap-2 rounded-12 bg-brand-600 py-3 text-[15px] font-medium text-white transition-colors hover:bg-brand-700 focus-visible:shadow-focus focus-visible:outline-none disabled:opacity-60"
          type="button"
          onClick={openApplyForm}
        >
          {t("apply.applyNow")} <ArrowRight size={16} />
        </button>
        {submitError.message && (
          <p className="mb-2.5 flex items-center justify-center gap-1 text-center text-[12px] text-red-600">
            <AlertCircle size={11} /> {submitError.message}
          </p>
        )}
      </>
    );
  }

  // Inline expand, not a modal — no Dialog/Sheet primitive exists anywhere in
  // this codebase (see ReportJobForm's identical rationale), and this form is
  // self-contained: JobDetailPage doesn't need to know it opened.
  // No border here — ApplyCard.tsx (the only place this renders) is
  // already its own bordered card; a second full border around this form,
  // nested directly inside it, doubled the framing. bg-white stays: form
  // fields need that contrast against ApplyCard's brand-tinted background
  // to stay legible, which a border alone doesn't provide.
  return (
    <div className="mb-2.5 space-y-3 rounded-12 bg-white p-4">
      <div>
        <p className="mb-1.5 text-[13px] font-medium text-neutral-700">
          {t("apply.resume")}
        </p>
        <FileUpload
          accept="application/pdf"
          key={resumeUrl ?? "none"}
          label={resumeUrl ? t("apply.replaceResume") : t("apply.attachResume")}
          type="resume"
          value={resumeUrl}
          onUploaded={(url) => setResumeOverride(url)}
        />
        {resumeUrl && !resumeOverride && (
          <p className="mt-1 text-[12px] text-neutral-400">
            {t("apply.usingProfileResume")}
          </p>
        )}
      </div>
      <div>
        <label
          className="mb-1.5 block text-[13px] font-medium text-neutral-700"
          htmlFor="cover-letter"
        >
          {t("apply.coverLetter")}{" "}
          <span className="text-neutral-400">{t("apply.optional")}</span>
        </label>
        <textarea
          className={TEXTAREA_INPUT_CLASS}
          id="cover-letter"
          maxLength={COVER_LETTER_MAX_LENGTH}
          placeholder={t("apply.coverPlaceholder")}
          rows={4}
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button
          className="flex-1"
          disabled={applyToJobMutation.isPending}
          isLoading={applyToJobMutation.isPending}
          type="button"
          onClick={handleSubmit}
        >
          {t("apply.send")}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setState("idle")}>
          {t("common.actions.cancel")}
        </Button>
      </div>
      {submitError.message && (
        <p className="flex items-center justify-center gap-1 text-center text-[12px] text-red-600">
          <AlertCircle size={11} /> {submitError.message}
        </p>
      )}
    </div>
  );
};
