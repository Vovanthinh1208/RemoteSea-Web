import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  useApplyToJob,
  useMyApplicationIds,
} from "@/features/applications/applications.queries";
import { ApiError } from "@/core/errors/api-error";
import { ROUTES } from "@/constants/routes";

const ALREADY_APPLIED_STATUS = 409;
const PROFILE_REQUIRED_STATUS = 403;

type ApplyState = "idle" | "applied" | "error";

interface ApplyButtonProps {
  jobId: string;
}

export const ApplyButton = ({ jobId }: ApplyButtonProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const applyToJobMutation = useApplyToJob();
  const { data: appliedJobIds } = useMyApplicationIds();
  const [state, setState] = useState<ApplyState>("idle");
  const [message, setMessage] = useState<string | null>(null);

  // Server-derived: previously "applied" was only a local flag, so leaving the
  // page and coming back reset the button to "Apply now" until a click bounced
  // off the 409. The ids query is the source of truth; local state remains the
  // immediate post-click fast path before the invalidated query refetches.
  const applied =
    state === "applied" || (appliedJobIds?.includes(jobId) ?? false);

  const handleApply = async () => {
    if (!user) {
      navigate(
        `${ROUTES.login}?callbackUrl=${encodeURIComponent(ROUTES.jobDetail(jobId))}`
      );
      return;
    }

    setMessage(null);
    try {
      await applyToJobMutation.mutateAsync({ jobId });
      setState("applied");
      toast({
        variant: "success",
        title: "Application sent",
        description: "The employer has been notified.",
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === ALREADY_APPLIED_STATUS) {
        setState("applied");
        setMessage("You already applied to this role.");
        toast({ variant: "info", title: "Already applied" });
        return;
      }
      if (err instanceof ApiError && err.status === PROFILE_REQUIRED_STATUS) {
        setMessage("Create a talent profile first.");
        setState("error");
        toast({
          variant: "info",
          title: "Finish your profile first",
        });
        navigate(ROUTES.profile);
        return;
      }
      setState("error");
      setMessage("Something went wrong. Please try again.");
      toast({
        variant: "error",
        title: "Couldn't submit application",
        description: "Please try again.",
      });
    }
  };

  if (applied) {
    return (
      <div className="mb-2.5 flex w-full items-center justify-center gap-2 rounded-12 border border-brand-200 bg-brand-50 py-3 text-[15px] font-medium text-brand-700">
        <Check size={16} /> Application sent
      </div>
    );
  }

  return (
    <>
      <button
        className="mb-2.5 w-full rounded-12 bg-brand-600 py-3 text-[15px] font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
        disabled={applyToJobMutation.isPending}
        type="button"
        onClick={handleApply}
      >
        {applyToJobMutation.isPending ? "Applying…" : "Apply now →"}
      </button>
      {message && (
        <p className="mb-2.5 text-center text-[12px] text-red-600">{message}</p>
      )}
    </>
  );
};
